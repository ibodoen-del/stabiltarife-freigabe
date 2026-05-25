const nodemailer = require("nodemailer");
const PDFDocument = require("pdfkit");

module.exports = async (req, res) => {

  if (req.method !== "POST") {
    return res.status(405).send("Nur POST erlaubt");
  }

  try {

    const {
      vorname,
      nachname,
      strasse,
      plz,
      stadt,
      geburtsdatum,
      email,
      unterschrift
    } = req.body;

    const doc = new PDFDocument({
      margin: 40
    });

    let buffers = [];

    doc.on("data", buffers.push.bind(buffers));

    doc.on("end", async () => {

      const pdfData = Buffer.concat(buffers);

      const transporter = nodemailer.createTransport({
        host: "smtp.ionos.de",
        port: 587,
        secure: false,
        auth: {
          user: "info@stabiltarife.de",
          pass: "22021998Zhn#.,"
        }
      });

      await transporter.sendMail({
        from: '"StabilTarife" <info@stabiltarife.de>',
        to: `${email}, info@stabiltarife.de`,
        subject: "Ihre StabilTarife Vollmacht",
        text: "Im Anhang befindet sich Ihre unterschriebene Vollmacht als PDF.",
        attachments: [
          {
            filename: "StabilTarife-Vollmacht.pdf",
            content: pdfData
          }
        ]
      });

      return res.status(200).json({
        success: true
      });

    });

    doc.fontSize(24).text("StabilTarife Vollmacht", {
      align: "center"
    });

    doc.moveDown(2);

    doc.fontSize(14);

    doc.text(`Vorname: ${vorname}`);
    doc.text(`Nachname: ${nachname}`);
    doc.text(`Straße: ${strasse}`);
    doc.text(`PLZ: ${plz}`);
    doc.text(`Stadt: ${stadt}`);
    doc.text(`Geburtsdatum: ${geburtsdatum}`);
    doc.text(`E-Mail: ${email}`);

    doc.moveDown(2);

    doc.text(
      "Hiermit berechtige ich StabilTarife bzw. Ibrahim Doenmez, in meinem Namen Energie- und Versicherungsangebote einzuholen, Tarifvergleiche durchzuführen und abzuschließen sowie mit Energieversorgern und Versicherungen zu kommunizieren."
    );

    doc.moveDown(3);

    doc.fontSize(16).text("Unterschrift:");

    if (unterschrift) {

      const base64Data = unterschrift.replace(
        /^data:image\/png;base64,/,
        ""
      );

      const imageBuffer = Buffer.from(base64Data, "base64");

      doc.image(imageBuffer, {
        fit: [250, 120]
      });

    }

    doc.end();

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      error: error.message
    });

  }

};
