import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import multer from 'multer';

const app = express();
const PORT = 3000;

// Support large JSON bodies (e.g. for base64 or rich payloads)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Setup local uploads storage directory
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
app.use('/uploads', express.static(UPLOADS_DIR));

// Setup Local JSON Database (db.json)
const DB_PATH = path.join(process.cwd(), 'db.json');

function getInitialDB() {
  const db: any = {
    Product: [],
    Category: [],
    Banner: [],
    SiteSettings: [],
    Order: [],
    ContactMessage: []
  };

  try {
    // 1. Seed Categories
    const categoriesPath = path.join(process.cwd(), 'Category.json');
    if (fs.existsSync(categoriesPath)) {
      db.Category = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));
    }
  } catch (err) {
    console.error('Error seeding Category:', err);
  }

  try {
    // 2. Seed Products
    const productsPath = path.join(process.cwd(), 'Product.json');
    if (fs.existsSync(productsPath)) {
      db.Product = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
    }
  } catch (err) {
    console.error('Error seeding Product:', err);
  }

  try {
    // 3. Seed SiteSettings
    const settingsPath = path.join(process.cwd(), 'SiteSettings.json');
    if (fs.existsSync(settingsPath)) {
      db.SiteSettings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    } else {
      db.SiteSettings = [{
        id: 'default-settings',
        site_name: 'Kozzak Mens Wear',
        logo: 'https://base44.app/api/apps/6a5e0623b671b808e3a154f8/files/mp/public/6a5e0623b671b808e3a154f8/13962702a_658752281_122097481034844528_3160809400522610555_n.jpg',
        admin_email: 'samirazmain8@gmail.com',
        admin_password: 'samir2998',
        footer_text: "Premium men's fashion for the modern gentleman. Crafted with precision, worn with confidence.",
        whatsapp_number: '+8801XXXXXXXXX',
        phone: '+8801XXXXXXXXX',
        address: 'Dhaka, Bangladesh'
      }];
    }
  } catch (err) {
    console.error('Error seeding SiteSettings:', err);
  }

  try {
    // 4. Seed default Banners
    db.Banner = [
      {
        id: 'banner-1',
        title: 'Elevate Your Style',
        slogan: 'Premium menswear crafted for the modern gentleman',
        image: 'https://media.base44.com/images/public/6a5e0623b671b808e3a154f8/a86fee29f_generated_23e56dac.png',
        order: 1,
        active: true,
        created_date: new Date().toISOString()
      },
      {
        id: 'banner-2',
        title: 'New Collection',
        slogan: 'Discover the art of sophisticated dressing',
        image: 'https://media.base44.com/images/public/6a5e0623b671b808e3a154f8/ca1eba1bb_generated_ee3d7de1.png',
        order: 2,
        active: true,
        created_date: new Date().toISOString()
      },
      {
        id: 'banner-3',
        title: 'Timeless Elegance',
        slogan: 'Where tradition meets modern craftsmanship',
        image: 'https://media.base44.com/images/public/6a5e0623b671b808e3a154f8/86b899b2c_generated_964ca257.png',
        order: 3,
        active: true,
        created_date: new Date().toISOString()
      }
    ];
  } catch (err) {
    console.error('Error seeding Banners:', err);
  }

  return db;
}

// Read database
function readDB() {
  if (!fs.existsSync(DB_PATH)) {
    const initial = getInitialDB();
    fs.writeFileSync(DB_PATH, JSON.stringify(initial, null, 2), 'utf8');
    return initial;
  }
  try {
    const content = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    console.error('DB read failed, returning initial:', err);
    return getInitialDB();
  }
}

// Write database
function writeDB(data: any) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('DB write failed:', err);
  }
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});
const upload = multer({ storage });

// =================== API ENDPOINTS ===================

// Multer File Upload
app.post('/api/integrations/Core/UploadFile', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ file_url: fileUrl });
});

// Server-Side Gemini API Proxy
app.post('/api/integrations/Core/InvokeLLM', async (req, res) => {
  const { prompt } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.warn('GEMINI_API_KEY environment variable is not defined.');
    return res.json({ response: "AI features are ready. Please configure your GEMINI_API_KEY in the Secrets panel to activate customer replies." });
  }

  try {
    const ai = new GoogleGenAI({ 
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    const aiResponse = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
    });
    res.json({ response: aiResponse.text || "I didn't receive a clear response. Let me know how I can help!" });
  } catch (err: any) {
    console.error('Gemini API call failed:', err);
    res.json({ response: "I'm having trouble connecting right now. Please try again in a moment!" });
  }
});

// Google sheets dummy record endpoint
app.post('/api/functions/recordOrderToSheets', (req, res) => {
  console.log('Recorded order to sheet:', req.body);
  res.json({ success: true });
});

// Dynamic REST APIs for Entity services
app.get('/api/entities/:entityName', (req, res) => {
  const { entityName } = req.params;
  const { q, sort, limit } = req.query;

  const db = readDB();
  let list = db[entityName] || [];

  // 1. Filter
  if (q) {
    try {
      const filterObj = JSON.parse(q as string);
      list = list.filter((item: any) => {
        for (const key in filterObj) {
          if (filterObj[key] !== item[key]) {
            return false;
          }
        }
        return true;
      });
    } catch (err) {
      console.error('Filter parsing failed:', err);
    }
  }

  // 2. Sort
  if (sort) {
    const sortStr = sort as string;
    const desc = sortStr.startsWith('-');
    const field = desc ? sortStr.substring(1) : sortStr;

    list = [...list].sort((a: any, b: any) => {
      let valA = a[field];
      let valB = b[field];

      if (field === 'created_date' || field === 'updated_date') {
        valA = valA ? new Date(valA).getTime() : 0;
        valB = valB ? new Date(valB).getTime() : 0;
      }

      if (valA === undefined || valA === null) return 1;
      if (valB === undefined || valB === null) return -1;

      if (valA < valB) return desc ? 1 : -1;
      if (valA > valB) return desc ? -1 : 1;
      return 0;
    });
  }

  // 3. Limit
  if (limit) {
    const lim = parseInt(limit as string, 10);
    if (!isNaN(lim)) {
      list = list.slice(0, lim);
    }
  }

  res.json(list);
});

app.get('/api/entities/:entityName/:id', (req, res) => {
  const { entityName, id } = req.params;
  const db = readDB();
  const list = db[entityName] || [];
  const item = list.find((x: any) => x.id === id);
  if (!item) {
    return res.status(404).json({ error: 'Not found' });
  }
  res.json(item);
});

app.post('/api/entities/:entityName', (req, res) => {
  const { entityName } = req.params;
  const payload = req.body;
  const db = readDB();
  if (!db[entityName]) {
    db[entityName] = [];
  }

  const newItem = {
    ...payload,
    id: payload.id || `kzk-${entityName.toLowerCase()}-${Date.now().toString(36)}-${Math.round(Math.random() * 1000)}`,
    created_date: new Date().toISOString(),
    updated_date: new Date().toISOString()
  };

  db[entityName].push(newItem);
  writeDB(db);
  res.json(newItem);
});

app.put('/api/entities/:entityName/:id', (req, res) => {
  const { entityName, id } = req.params;
  const payload = req.body;
  const db = readDB();
  const list = db[entityName] || [];
  const index = list.findIndex((x: any) => x.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Not found' });
  }

  const updatedItem = {
    ...list[index],
    ...payload,
    id, // preserve id
    updated_date: new Date().toISOString()
  };

  list[index] = updatedItem;
  db[entityName] = list;
  writeDB(db);
  res.json(updatedItem);
});

app.delete('/api/entities/:entityName/:id', (req, res) => {
  const { entityName, id } = req.params;
  const db = readDB();
  const list = db[entityName] || [];
  const filtered = list.filter((x: any) => x.id !== id);
  db[entityName] = filtered;
  writeDB(db);
  res.json({ success: true });
});

// Logs mapping helper (to prevent client error logs)
app.post('/api/app-logs/*', (req, res) => {
  res.json({ success: true });
});

// =================== ASSET SERVING ===================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Only listen if not running in a serverless environment (like Vercel)
  if (!process.env.VERCEL) {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  }
}

startServer();

export default app;
