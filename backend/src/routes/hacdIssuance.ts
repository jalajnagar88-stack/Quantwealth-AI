import express, { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { HacdLaunchSpec, IHacdLaunchSpec } from '../models/HacdLaunchSpec';
import { generateAllDocuments, generateSingleDocument } from '../services/HacdDocumentGenerator';
import { validateLaunchSpec } from '../services/HacdValidator';
import { expandGoogleFormToIntake } from '../services/HacdIntakeExpander';
import { scoreProject } from '../services/HacdProjectScorer';
import { roastLaunchSpec } from '../services/HacdRoastMode';

const router: Router = express.Router();
router.use(authMiddleware);

// Create new launch spec (draft)
router.post('/create', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const specData = req.body;
    
    // Create new draft spec
    const spec = await HacdLaunchSpec.create({
      userId,
      schema_version: '1.0',
      project: specData.project,
      asset: specData.asset,
      stack: specData.stack,
      launch: {
        ...specData.launch,
        status: 'draft',
      },
      copy: specData.copy,
      review: {
        issuer_confirmed: false,
        hacd_labs_reviewed: false,
        legal_review_required: false,
        notes: [],
      },
      generated_docs: {},
    });

    res.json({ success: true, data: spec });
  } catch (error: any) {
    console.error('Create launch spec error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to create launch spec' });
  }
});

// Get user's launch specs
router.get('/list', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const specs = await HacdLaunchSpec.find({ userId }).sort({ createdAt: -1 });
    res.json({ success: true, data: specs });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch launch specs' });
  }
});

// Get single launch spec
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const spec = await HacdLaunchSpec.findOne({ _id: req.params.id, userId });
    if (!spec) {
      return res.status(404).json({ success: false, message: 'Launch spec not found' });
    }

    res.json({ success: true, data: spec });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch launch spec' });
  }
});

// Update launch spec
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const spec = await HacdLaunchSpec.findOneAndUpdate(
      { _id: req.params.id, userId },
      { $set: req.body, updatedAt: new Date() },
      { new: true }
    );

    if (!spec) {
      return res.status(404).json({ success: false, message: 'Launch spec not found' });
    }

    res.json({ success: true, data: spec });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to update launch spec' });
  }
});

// Generate all 8 documents
router.post('/:id/generate-all', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const spec = await HacdLaunchSpec.findOne({ _id: req.params.id, userId });
    if (!spec) {
      return res.status(404).json({ success: false, message: 'Launch spec not found' });
    }

    // Generate all documents
    const docs = await generateAllDocuments(spec);

    // Update spec with generated docs
    spec.generated_docs = docs;
    spec.updatedAt = new Date();
    await spec.save();

    res.json({ success: true, data: { generated_docs: docs } });
  } catch (error: any) {
    console.error('Generate documents error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to generate documents' });
  }
});

// Generate single document
router.post('/:id/generate/:docType', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { docType } = req.params;
    const spec = await HacdLaunchSpec.findOne({ _id: req.params.id, userId });
    if (!spec) {
      return res.status(404).json({ success: false, message: 'Launch spec not found' });
    }

    // Generate single document
    const doc = await generateSingleDocument(docType, spec);

    // Update spec
    (spec.generated_docs as any)[docType] = doc;
    spec.updatedAt = new Date();
    await spec.save();

    res.json({ success: true, data: { [docType]: doc } });
  } catch (error: any) {
    console.error('Generate document error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to generate document' });
  }
});

// Validate launch spec
router.post('/:id/validate', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const spec = await HacdLaunchSpec.findOne({ _id: req.params.id, userId });
    if (!spec) {
      return res.status(404).json({ success: false, message: 'Launch spec not found' });
    }

    // Run validation
    const result = validateLaunchSpec(spec);

    // Update spec with validation result
    spec.validation_result = {
      ...result,
      timestamp: new Date(),
    };
    spec.updatedAt = new Date();
    await spec.save();

    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Validation failed' });
  }
});

// Delete launch spec
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const spec = await HacdLaunchSpec.findOneAndDelete({ _id: req.params.id, userId });
    if (!spec) {
      return res.status(404).json({ success: false, message: 'Launch spec not found' });
    }

    res.json({ success: true, message: 'Launch spec deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to delete launch spec' });
  }
});

// Export launch spec as JSON (for submission)
router.get('/:id/export', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const spec = await HacdLaunchSpec.findOne({ _id: req.params.id, userId });
    if (!spec) {
      return res.status(404).json({ success: false, message: 'Launch spec not found' });
    }

    // Export as clean JSON (without MongoDB fields)
    const exportData = {
      schema_version: spec.schema_version,
      project: spec.project,
      asset: spec.asset,
      stack: spec.stack,
      launch: spec.launch,
      copy: spec.copy,
      review: spec.review,
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${spec.project.ticker}_launch_spec.json"`);
    res.send(JSON.stringify(exportData, null, 2));
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Export failed' });
  }
});

// Expand Google Form answers to full intake form
router.post('/expand-intake', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const answers = req.body;
    const intakeForm = await expandGoogleFormToIntake(answers);
    res.json({ success: true, data: intakeForm });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Intake expansion failed' });
  }
});

// Score project (5 criteria)
router.post('/:id/score', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const spec = await HacdLaunchSpec.findOne({ _id: req.params.id, userId });
    if (!spec) {
      return res.status(404).json({ success: false, message: 'Launch spec not found' });
    }

    const scoreResult = scoreProject(spec);
    res.json({ success: true, data: scoreResult });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Scoring failed' });
  }
});

// Roast mode (self-review)
router.post('/:id/roast', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const spec = await HacdLaunchSpec.findOne({ _id: req.params.id, userId });
    if (!spec) {
      return res.status(404).json({ success: false, message: 'Launch spec not found' });
    }

    const roastResult = await roastLaunchSpec(spec);
    res.json({ success: true, data: roastResult });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Roast mode failed' });
  }
});

export default router;
