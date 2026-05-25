import nodemailer from "nodemailer";
import PDFDocument from "pdfkit";

export default async function handler(req, res) {

if (req.method !== "POST") {
return res.status(405).json({ error: "Nur POST erlaubt" });
}

try {

const {
vorname,
nachname,
strasse,
plz,
stadt,
geburt,
email,
signature
} = req.body;

const doc = new PDFDocument();

let buffers = [];

doc.on("data", buffers.push.bind(buffers));

doc.fontSize(22).text("StabilTarife Vollmacht", {
align: "center"
});

doc.moveDown();

doc.fontSize(12).text(`Vorname: ${vorname}`);
doc.text(`Nachname: ${nachname}`);
doc.text(`Straße: ${strasse}`);
doc.text(`PLZ: ${plz}`);
doc.text(`Stadt: ${stadt}`);
doc.text(`Geburtsdatum: ${geburt}`);
doc.text(`E-Mail: ${email}`);

doc.moveDown();

doc.text(`
Hiermit berechtige ich StabilTarife bzw. Ibrahim Doenmez,
in meinem Namen Energie- und Versicherungsangebote einzuholen,
Tarifvergleiche durchzuführen und abzuschließen sowie mit
Energieversorgern und Versicherungen zu kommunizieren.
`);

doc.moveDown();

doc.text("Unterschrift:");

const base64Data = signature.replace(
/^data:image\/png;base64,/,
""
);

const imgBuffer = Buffer.from(base64Data, "base64");

doc.image(imgBuffer, {
fit: [250, 120]
});

doc.end();

doc.on("end", async () => {

const pdfBuffer = Buffer.concat(buffers);

const transporter = nodemailer.createTransport({

host: "smtp.ionos.de",
port: 587,
secure: false,

auth: {
user: "info@stabiltarife.de",
pass: "DEIN_PASSWORT_HIER"
}

});

await transporter.sendMail({

from: '"StabilTarife" <info@stabiltarife.de>',

to: `${email}, info@stabiltarife.de`,

subject: "Ihre StabilTarife Vollmacht",

text: "Im Anhang befindet sich Ihre Vollmacht.",

attachments: [
{
filename: "StabilTarife-Vollmacht.pdf",
content: pdfBuffer
}
]

});

return res.status(200).json({
success: true
});

});

} catch (err) {

return res.status(500).json({
error: err.message
});

}

}
