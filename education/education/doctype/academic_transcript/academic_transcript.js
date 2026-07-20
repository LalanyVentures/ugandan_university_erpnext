frappe.ui.form.on("Academic Transcript", {
	refresh(frm) {
		const viewable = frm.doc.transcript_type === "Official"
			? frm.doc.status === "Registrar Issued"
			: ["Faculty Head Approved", "Registrar Issued"].includes(frm.doc.status);
		frm.toggle_display("generated_pdf", viewable);
		frm.toggle_display("verification_number", viewable);
	},
});
