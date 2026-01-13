'use client';

export const generatePDF = async (type: 'patient' | 'hospital', appointmentId?: string) => {
  try {
    const params = new URLSearchParams({ type });
    if (appointmentId) params.append('appointmentId', appointmentId);
    
    const response = await fetch(`/api/reports?${params}`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to generate PDF');
    }
    
    // Import jsPDF dynamically for client-side use
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    
    if (type === 'patient' && data.appointment) {
      const apt = data.appointment;
      
      doc.setFontSize(20);
      doc.text('Appointment Receipt', 20, 30);
      
      doc.setFontSize(12);
      doc.text(`Hospital: ${apt.hospitalId.name}`, 20, 50);
      doc.text(`Address: ${apt.hospitalId.address}`, 20, 60);
      doc.text(`Phone: ${apt.hospitalId.phone}`, 20, 70);
      
      doc.text(`Patient: ${apt.patientId.name}`, 20, 90);
      doc.text(`Email: ${apt.patientId.email}`, 20, 100);
      doc.text(`Phone: ${apt.patientId.phone}`, 20, 110);
      
      doc.text(`Doctor: ${apt.doctorId.name}`, 20, 130);
      doc.text(`Specialization: ${apt.doctorId.specialization}`, 20, 140);
      doc.text(`Date: ${new Date(apt.appointmentDate).toLocaleDateString()}`, 20, 150);
      doc.text(`Time: ${apt.timeSlot}`, 20, 160);
      doc.text(`Status: ${apt.status.toUpperCase()}`, 20, 170);
      
      if (apt.symptoms) {
        doc.text(`Symptoms: ${apt.symptoms}`, 20, 180);
      }
      
      doc.save(`appointment-receipt-${appointmentId}.pdf`);
      
    } else if (type === 'hospital' && data.hospital && data.appointments) {
      const hospital = data.hospital;
      const appointments = data.appointments;
      
      doc.setFontSize(16);
      doc.text(`Appointments Report - ${hospital.name}`, 20, 30);
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 40);
      
      let yPosition = 60;
      
      appointments.forEach((apt: any, index: number) => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 30;
        }
        
        doc.text(`${index + 1}. ${apt.patientId.name} - Dr. ${apt.doctorId.name}`, 20, yPosition);
        doc.text(`   Date: ${new Date(apt.appointmentDate).toLocaleDateString()} | Status: ${apt.status}`, 20, yPosition + 10);
        yPosition += 25;
      });
      
      doc.save(`appointments-report-${hospital.name.replace(/\s+/g, '-')}.pdf`);
    }
    
  } catch (error) {
    console.error('PDF generation error:', error);
    throw error;
  }
};