import express, { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/authPG';
import { getPool } from '../config/database';
import { generateAllDocuments, generateSingleDocument } from '../services/HacdDocumentGenerator';
import { validateLaunchSpec } from '../services/HacdValidator';
import { expandGoogleFormToIntake } from '../services/HacdIntakeExpander';
import { scoreProject } from '../services/HacdProjectScorer';
import { roastLaunchSpec } from '../services/HacdRoastMode';
import { performWebResearch, researchHACPrice, researchRecentLaunches, researchCommunitySentiment } from '../services/HacdWebResearch';

const router: Router = express.Router();
router.use(authMiddleware);

// Create new launch spec (draft)
router.post('/create', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const specData = req.body;
    const pool = getPool();
    
    if (!pool) {
      return res.status(500).json({ success: false, message: 'Database connection failed' });
    }

    const result = await pool.query(
      `INSERT INTO hacd_launch_specs (user_id, project_name, project_description, category, team_info, asset_type, total_supply, token_name, token_symbol, stack_cost, total_hacd_lots, units_per_hacd_lot, phase_model, removal_effect, designated_address, network_fee_required, launchpad_url, short_description, long_description, marketing_copy, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, 'draft')
       RETURNING *`,
      [
        userId,
        specData.project?.name,
        specData.project?.description,
        specData.project?.category,
        JSON.stringify(specData.project?.team || {}),
        specData.asset?.type,
        specData.asset?.totalSupply,
        specData.asset?.tokenName,
        specData.asset?.tokenSymbol,
        specData.stack?.stackCost,
        specData.stack?.totalHacdLots,
        specData.stack?.unitsPerHacdLot,
        specData.stack?.phaseModel,
        specData.stack?.removalEffect,
        specData.launch?.designatedAddress,
        specData.launch?.networkFeeRequired,
        specData.launch?.launchpadUrl,
        specData.copy?.shortDescription,
        specData.copy?.longDescription,
        specData.copy?.marketingCopy
      ]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    console.error('Create launch spec error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to create launch spec' });
  }
});

// List user's launch specs
router.get('/list', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const pool = getPool();
    
    if (!pool) {
      return res.status(500).json({ success: false, message: 'Database connection failed' });
    }

    const result = await pool.query(
      'SELECT * FROM hacd_launch_specs WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    res.json({ success: true, data: result.rows });
  } catch (error: any) {
    console.error('List launch specs error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to list launch specs' });
  }
});

// Get single launch spec
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const specId = req.params.id;
    
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const pool = getPool();
    
    if (!pool) {
      return res.status(500).json({ success: false, message: 'Database connection failed' });
    }

    const result = await pool.query(
      'SELECT * FROM hacd_launch_specs WHERE id = $1 AND user_id = $2',
      [specId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Launch spec not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    console.error('Get launch spec error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to get launch spec' });
  }
});

// Update launch spec
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const specId = req.params.id;
    const specData = req.body;
    
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const pool = getPool();
    
    if (!pool) {
      return res.status(500).json({ success: false, message: 'Database connection failed' });
    }

    const result = await pool.query(
      `UPDATE hacd_launch_specs 
       SET project_name = $2, project_description = $3, category = $4, team_info = $5, 
           asset_type = $6, total_supply = $7, token_name = $8, token_symbol = $9, 
           stack_cost = $10, total_hacd_lots = $11, units_per_hacd_lot = $12, phase_model = $13, 
           removal_effect = $14, designated_address = $15, network_fee_required = $16, 
           launchpad_url = $17, short_description = $18, long_description = $19, marketing_copy = $20
       WHERE id = $1 AND user_id = $21
       RETURNING *`,
      [
        specId,
        specData.project?.name,
        specData.project?.description,
        specData.project?.category,
        JSON.stringify(specData.project?.team || {}),
        specData.asset?.type,
        specData.asset?.totalSupply,
        specData.asset?.tokenName,
        specData.asset?.tokenSymbol,
        specData.stack?.stackCost,
        specData.stack?.totalHacdLots,
        specData.stack?.unitsPerHacdLot,
        specData.stack?.phaseModel,
        specData.stack?.removalEffect,
        specData.launch?.designatedAddress,
        specData.launch?.networkFeeRequired,
        specData.launch?.launchpadUrl,
        specData.copy?.shortDescription,
        specData.copy?.longDescription,
        specData.copy?.marketingCopy,
        userId
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Launch spec not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    console.error('Update launch spec error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to update launch spec' });
  }
});

// Delete launch spec
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const specId = req.params.id;
    
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const pool = getPool();
    
    if (!pool) {
      return res.status(500).json({ success: false, message: 'Database connection failed' });
    }

    const result = await pool.query(
      'DELETE FROM hacd_launch_specs WHERE id = $1 AND user_id = $21 RETURNING *',
      [specId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Launch spec not found' });
    }

    res.json({ success: true, message: 'Launch spec deleted successfully' });
  } catch (error: any) {
    console.error('Delete launch spec error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to delete launch spec' });
  }
});

// Generate all documents
router.post('/:id/generate-all', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const specId = req.params.id;
    
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const pool = getPool();
    
    if (!pool) {
      return res.status(500).json({ success: false, message: 'Database connection failed' });
    }

    const result = await pool.query(
      'SELECT * FROM hacd_launch_specs WHERE id = $1 AND user_id = $2',
      [specId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Launch spec not found' });
    }

    const spec = result.rows[0];
    
    // Generate documents using existing service
    const documents = await generateAllDocuments(spec);
    
    // Update documents in database
    await pool.query(
      'UPDATE hacd_launch_specs SET documents = $1, status = $2 WHERE id = $3',
      [JSON.stringify(documents), 'generated', specId]
    );

    res.json({ success: true, data: documents });
  } catch (error: any) {
    console.error('Generate documents error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to generate documents' });
  }
});

// Validate launch spec
router.post('/:id/validate', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const specId = req.params.id;
    
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const pool = getPool();
    
    if (!pool) {
      return res.status(500).json({ success: false, message: 'Database connection failed' });
    }

    const result = await pool.query(
      'SELECT * FROM hacd_launch_specs WHERE id = $1 AND user_id = $2',
      [specId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Launch spec not found' });
    }

    const spec = result.rows[0];
    const validationResult = validateLaunchSpec(spec);
    
    // Update validation result in database
    await pool.query(
      'UPDATE hacd_launch_specs SET validation_result = $1, status = $2 WHERE id = $3',
      [JSON.stringify(validationResult), validationResult.passed ? 'validated' : 'draft', specId]
    );

    res.json({ success: true, data: validationResult });
  } catch (error: any) {
    console.error('Validate launch spec error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to validate launch spec' });
  }
});

// Export as JSON
router.get('/:id/export', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const specId = req.params.id;
    
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const pool = getPool();
    
    if (!pool) {
      return res.status(500).json({ success: false, message: 'Database connection failed' });
    }

    const result = await pool.query(
      'SELECT * FROM hacd_launch_specs WHERE id = $1 AND user_id = $2',
      [specId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Launch spec not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    console.error('Export launch spec error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to export launch spec' });
  }
});

// Score project
router.post('/:id/score', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const specId = req.params.id;
    
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const pool = getPool();
    
    if (!pool) {
      return res.status(500).json({ success: false, message: 'Database connection failed' });
    }

    const result = await pool.query(
      'SELECT * FROM hacd_launch_specs WHERE id = $1 AND user_id = $2',
      [specId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Launch spec not found' });
    }

    const spec = result.rows[0];
    const scoreResult = scoreProject(spec);
    
    // Update score in database
    await pool.query(
      'UPDATE hacd_launch_specs SET project_score = $1 WHERE id = $2',
      [JSON.stringify(scoreResult), specId]
    );

    res.json({ success: true, data: scoreResult });
  } catch (error: any) {
    console.error('Score project error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to score project' });
  }
});

// Roast mode
router.post('/:id/roast', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const specId = req.params.id;
    
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const pool = getPool();
    
    if (!pool) {
      return res.status(500).json({ success: false, message: 'Database connection failed' });
    }

    const result = await pool.query(
      'SELECT * FROM hacd_launch_specs WHERE id = $1 AND user_id = $2',
      [specId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Launch spec not found' });
    }

    const spec = result.rows[0];
    const roastResult = await roastLaunchSpec(spec);
    
    // Update roast result in database
    await pool.query(
      'UPDATE hacd_launch_specs SET roast_result = $1 WHERE id = $2',
      [JSON.stringify(roastResult), specId]
    );

    res.json({ success: true, data: roastResult });
  } catch (error: any) {
    console.error('Roast launch spec error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to roast launch spec' });
  }
});

// Expand intake
router.post('/expand-intake', async (req: Request, res: Response) => {
  try {
    const googleFormAnswers = req.body;
    const expandedIntake = expandGoogleFormToIntake(googleFormAnswers);
    
    res.json({ success: true, data: expandedIntake });
  } catch (error: any) {
    console.error('Expand intake error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to expand intake' });
  }
});

// Web research
router.post('/research', async (req: Request, res: Response) => {
  try {
    const { query } = req.body;
    const researchResult = await performWebResearch(query);
    
    res.json({ success: true, data: researchResult });
  } catch (error: any) {
    console.error('Web research error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to perform web research' });
  }
});

router.get('/research/hac-price', async (req: Request, res: Response) => {
  try {
    const researchResult = await researchHACPrice();
    res.json({ success: true, data: researchResult });
  } catch (error: any) {
    console.error('HAC price research error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to research HAC price' });
  }
});

router.get('/research/recent-launches', async (req: Request, res: Response) => {
  try {
    const researchResult = await researchRecentLaunches();
    res.json({ success: true, data: researchResult });
  } catch (error: any) {
    console.error('Recent launches research error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to research recent launches' });
  }
});

export default router;
