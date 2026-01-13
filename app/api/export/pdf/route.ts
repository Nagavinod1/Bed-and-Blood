import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const Hospital = mongoose.model('Hospital');
    const Doctor = mongoose.model('Doctor');

    const hospitals = await Hospital.find().populate('userId', 'name email phone');
    const doctors = await Doctor.find().populate('hospitalId', 'name');

    const doc = new jsPDF();
    let yPosition = 20;
    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Title
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 139);
    doc.text('Hospital Management System', 20, yPosition);
    yPosition += 10;

    // Subtitle
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Hospitals & Doctors Report`, 20, yPosition);
    yPosition += 5;
    doc.text(`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 20, yPosition);
    yPosition += 15;

    // Process each hospital
    hospitals.forEach((hospital: any, index: number) => {
      // Add page if needed
      if (yPosition > 230) {
        doc.addPage();
        yPosition = 20;
      }

      // Hospital Header
      doc.setFontSize(13);
      doc.setTextColor(0, 0, 139);
      doc.text(`${index + 1}. ${hospital.name}`, 20, yPosition);
      yPosition += 8;

      // Hospital Admin Section
      doc.setFontSize(9);
      doc.setTextColor(50, 50, 50);
      doc.text('Hospital Admin Details:', 22, yPosition);
      yPosition += 5;

      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      doc.text(`  Name: ${hospital.userId?.name || 'N/A'}`, 25, yPosition);
      yPosition += 4;
      doc.text(`  Email: ${hospital.userId?.email || 'N/A'}`, 25, yPosition);
      yPosition += 4;
      doc.text(`  Phone: ${hospital.userId?.phone || 'N/A'}`, 25, yPosition);
      yPosition += 6;

      // Hospital Details Section
      doc.setFontSize(9);
      doc.setTextColor(50, 50, 50);
      doc.text('Hospital Details:', 22, yPosition);
      yPosition += 5;

      doc.setFontSize(8);
      doc.setTextColor(0, 0, 0);
      doc.text(`  Address: ${hospital.address}`, 25, yPosition);
      yPosition += 4;
      doc.text(`  Phone: ${hospital.phone}`, 25, yPosition);
      yPosition += 4;
      doc.text(`  Email: ${hospital.email}`, 25, yPosition);
      yPosition += 4;
      doc.text(`  City: ${hospital.city}`, 25, yPosition);
      yPosition += 4;
      doc.text(`  Specialties: ${hospital.specialties.join(', ')}`, 25, yPosition);
      yPosition += 4;
      doc.text(`  Rating: ${hospital.rating.toFixed(2)} ⭐ (${hospital.totalReviews} reviews)`, 25, yPosition);
      yPosition += 8;

      // Doctors Section
      const hospitalDoctors = doctors.filter(
        (d: any) => d.hospitalId?._id?.toString() === hospital._id.toString()
      );

      if (hospitalDoctors.length > 0) {
        // Check if there's space for table
        if (yPosition > 200) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(9);
        doc.setTextColor(50, 50, 50);
        doc.text('Assigned Doctors:', 22, yPosition);
        yPosition += 6;

        const doctorRows = hospitalDoctors.map((doc: any, idx: number) => [
          (idx + 1).toString(),
          doc.name,
          doc.specialization,
          `${doc.experience} yrs`,
          `₹${doc.consultationFee}`,
          doc.qualification,
          doc.availableSlots.join(', '),
          doc.isAvailable ? '✓ Active' : '✗ Inactive'
        ]);

        (doc as any).autoTable({
          startY: yPosition,
          head: [['#', 'Doctor Name', 'Specialization', 'Experience', 'Fee', 'Qualification', 'Available Times', 'Status']],
          body: doctorRows,
          margin: { left: 22, right: 15 },
          theme: 'grid',
          headStyles: {
            fillColor: [70, 130, 180],
            textColor: [255, 255, 255],
            fontSize: 8,
            fontStyle: 'bold'
          },
          bodyStyles: {
            fontSize: 8,
            cellPadding: 3
          },
          alternateRowStyles: {
            fillColor: [240, 245, 250]
          },
          columnStyles: {
            0: { cellWidth: 12 },
            1: { cellWidth: 25 },
            2: { cellWidth: 20 },
            3: { cellWidth: 15 },
            4: { cellWidth: 18 },
            5: { cellWidth: 30 },
            6: { cellWidth: 25 },
            7: { cellWidth: 15 }
          }
        });

        yPosition = (doc as any).lastAutoTable.finalY + 15;
      } else {
        doc.setFontSize(9);
        doc.setTextColor(200, 50, 50);
        doc.text('  No doctors assigned to this hospital', 25, yPosition);
        yPosition += 10;
      }

      yPosition += 5;
    });

    // Footer - Summary Page
    if (yPosition > 200) {
      doc.addPage();
      yPosition = 20;
    }

    yPosition += 10;
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 139);
    doc.text('Summary', 20, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Total Hospitals: ${hospitals.length}`, 25, yPosition);
    yPosition += 6;
    doc.text(`Total Doctors: ${doctors.length}`, 25, yPosition);
    yPosition += 6;
    doc.text(`Average Hospital Rating: ${(hospitals.reduce((sum: number, h: any) => sum + h.rating, 0) / hospitals.length).toFixed(2)} ⭐`, 25, yPosition);

    // Convert to buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="hospitals-doctors-report.pdf"'
      }
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
