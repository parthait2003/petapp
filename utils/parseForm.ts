import { IncomingMessage } from 'http';
import formidable, { Fields, Files } from 'formidable';

export const parseForm = (req: IncomingMessage): Promise<{ fields: Fields; files: Files }> => {
  const form = formidable({
    keepExtensions: true,
    uploadDir: 'assets/trainee',
    multiples: true,
  });

  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      resolve({ fields, files });
    });
  });
};

// Disable the default body parser
export const config = {
  api: {
    bodyParser: false,
  },
};
