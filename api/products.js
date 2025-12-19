const { GoogleSpreadsheet } = require('google-spreadsheet');

module.exports = async (req, res) => {
  try {
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEETS_ID);

    await doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, '\n'),
    });

    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];
    const rows = await sheet.getRows();

    const products = rows.map(r => ({
      name: r.Name,
      description: r.Description,
      image: r.Image,
    }));

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

