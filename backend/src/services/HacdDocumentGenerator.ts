import axios from 'axios';
import { IHacdLaunchSpec, AssetType, ProjectCategory } from '../models/HacdLaunchSpec';
import { getEcosystemContext } from '../constants/HacdEcosystem';
import { HACD_PROMPTS } from '../constants/HacdPrompts';

// HACD Ecosystem knowledge — from ECOSYSTEM.md (single source of truth)
const HACD_ECOSYSTEM_CONTEXT = getEcosystemContext();

// Generate a single document using Virtuals API
async function generateDocument(prompt: string): Promise<string> {
  const VIRTUALS_BASE_URL = process.env.VIRTUALS_BASE_URL || 'https://compute.virtuals.io/v1';
  const VIRTUALS_API_KEY = process.env.VIRTUALS_API_KEY || '';
  const VIRTUALS_MODEL = process.env.VIRTUALS_MODEL || 'gemini-3-flash-preview';
  
  if (!VIRTUALS_API_KEY) {
    throw new Error('VIRTUALS_API_KEY not set');
  }

  const response = await axios.post(
    `${VIRTUALS_BASE_URL}/chat/completions`,
    {
      model: VIRTUALS_MODEL,
      messages: [
        {
          role: 'system',
          content: `You are a HACD Stack Token issuance expert. You know the full Hacash ecosystem, the correct terminology, the supply math rules, and every safety check required before a project can go live on the Launchpad.

${HACD_ECOSYSTEM_CONTEXT}

Your output must be:
- Factually accurate per the ecosystem context above
- Mathematically precise (supply equations must be correct)
- Copy-safe (no price guarantees, investment advice, or risk-free claims)
- Professional and concise
- In Markdown format`,
        },
        { role: 'user', content: prompt },
      ],
      max_tokens: 4096,
      temperature: 0.7,
    },
    {
      headers: {
        Authorization: `Bearer ${VIRTUALS_API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    }
  );

  return response.data?.choices?.[0]?.message?.content || '';
}

// Generate all 8 documents for a launch spec
export async function generateAllDocuments(spec: IHacdLaunchSpec): Promise<Record<string, string>> {
  const docs: Record<string, string> = {};

  // 1. issuer_intake_form.md
  docs.issuer_intake_form = await generateDocument(HACD_PROMPTS.issuerIntake());

  // 2. incubator_fit_review.md
  docs.incubator_fit_review = await generateDocument(HACD_PROMPTS.incubatorFitReview(spec));

  // 3. project_profile.md
  docs.project_profile = await generateDocument(HACD_PROMPTS.projectProfile(spec));

  // 4. stack_design.md
  docs.stack_design = await generateDocument(HACD_PROMPTS.stackDesign(spec));

  // 5. launchpad_copy.md
  docs.launchpad_copy = await generateDocument(HACD_PROMPTS.launchpadCopy(spec));

  // 6. issuer_faq.md
  docs.issuer_faq = await generateDocument(HACD_PROMPTS.issuerFaq(spec));

  // 7. x_announcement.md
  docs.x_announcement = await generateDocument(HACD_PROMPTS.xAnnouncement(spec));

  // 8. review_checklist.md
  docs.review_checklist = await generateDocument(HACD_PROMPTS.reviewChecklist(spec));

  return docs;
}

// Generate a single document on-demand
export async function generateSingleDocument(
  docType: string,
  spec: IHacdLaunchSpec
): Promise<string> {
  const prompts: Record<string, string> = {
    issuer_intake_form: `Generate issuer_intake_form.md for ${spec.project.name} (${spec.project.ticker})`,
    incubator_fit_review: `Generate incubator_fit_review.md for ${spec.project.name} (${spec.project.ticker})`,
    project_profile: `Generate project_profile.md for ${spec.project.name} (${spec.project.ticker})`,
    stack_design: `Generate stack_design.md for ${spec.project.name} (${spec.project.ticker})`,
    launchpad_copy: `Generate launchpad_copy.md for ${spec.project.name} (${spec.project.ticker})`,
    issuer_faq: `Generate issuer_faq.md for ${spec.project.name} (${spec.project.ticker})`,
    x_announcement: `Generate x_announcement.md for ${spec.project.name} (${spec.project.ticker})`,
    review_checklist: `Generate review_checklist.md for ${spec.project.name} (${spec.project.ticker})`,
  };

  const prompt = prompts[docType];
  if (!prompt) {
    throw new Error(`Unknown document type: ${docType}`);
  }

  return generateDocument(prompt);
}
