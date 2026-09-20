/**
 * illustrations/previews.tsx — Remotion Studio preview wrappers.
 *
 * Each export bakes sample props into an <IlluStage> so the component shows up
 * in `npx remotion studio` under an `Illu-*` id (registered in Root.tsx). They
 * double as the canonical worked example for each structural component — copy
 * the props block into a real reel and edit the data.
 */
import React from 'react';
import { IlluStage } from './kit';
import { LayerStack, SourceFlow, ChipGrid, PredictCard } from './structural';

export const LayerStackPreview: React.FC = () => (
  <IlluStage spark="Three layers.">
    <LayerStack
      layers={[
        { title: 'a free tier', sub: 'premium Claude · verified US K-12 educators' },
        { title: 'a skills library', sub: 'teaching skills — open-source, on GitHub' },
        { title: 'connectors', sub: 'state standards + nine classroom tools (MCP)', accent: true },
      ]}
      caption="not an app you go to — plumbing into the Claude you already use"
    />
  </IlluStage>
);

export const SourceFlowPreview: React.FC = () => (
  <IlluStage spark="Served as data.">
    <SourceFlow
      sourceLabel="Learning Commons"
      feeds={[
        { label: '50-state standards' },
        { label: 'competencies, in order', tint: '#8A7B57' },
        { label: 'OpenSciEd', tint: '#5E7D7A' },
        { label: 'Illustrative Mathematics', tint: '#7A6C8F' },
      ]}
      destApp="Cowork"
      destTitle="plan Monday's lesson"
      arcCaption="served as data, not prose"
      settleLine="scaffolded to your state…"
    />
  </IlluStage>
);

export const ChipGridPreview: React.FC = () => (
  <IlluStage spark="Nine tools.">
    <ChipGrid
      items={['Canva Education', 'MagicSchool', 'Diffit', 'ASSISTments', 'Brisk', 'Coteach', 'Eedi', 'Snorkl', 'TeachFX']}
      caption="the Figma/Canva pattern, for the classroom — your tools become things Claude can drive"
    />
  </IlluStage>
);

export const PredictCardPreview: React.FC = () => (
  <IlluStage spark="Commit first.">
    <PredictCard
      question="What's the most likely failure mode?"
      commit="commit to an answer before the next beat"
    />
  </IlluStage>
);
