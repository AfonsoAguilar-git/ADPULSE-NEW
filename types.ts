import React from 'react';

export interface NavItem {
  label: string;
  href: string;
}

export interface Persona {
  role: string;
  icon: React.ReactNode;
  frustration: string;
  outcome: string;
}

export interface Feature {
  title: string;
  benefit: string;
  icon: React.ReactNode;
}

export enum AspectRatio {
  LANDSCAPE = '16:9',
  PORTRAIT = '9:16'
}

export type ImageSize = '1K' | '2K' | '4K';

export interface VideoGenerationConfig {
  prompt: string;
  imageBase64?: string;
  mimeType?: string;
  aspectRatio: AspectRatio;
}

export interface VideoAnalysisResult {
  is_ad: boolean;
  confidence_score: number;
  classification_reason: string;
  structure: {
    hook: {
        detected: boolean;
        type: string; // e.g. "Visual Shock", "Question", "Negative Hook"
        description: string;
        effectiveness_score: number; // 1-10
    };
    flow: {
        pacing: string; // "Fast/TikTok", "Cinematic/Slow", "Moderate"
        structure_type: string; // "PAS", "Testimonial", "Demo", "Story"
    };
    elements: {
        audio_style: string; // "Voiceover", "Trending Music", "ASMR"
        visual_style: string; // "UGC", "High Production", "Animation"
        text_overlay_usage: string; // "Heavy", "Key Points", "None"
    };
    cta: {
        detected: boolean;
        type: string; // "Soft", "Hard", "Button"
        content: string;
    };
  };
  metrics: {
    commercial_intent_score: number;
    target_audience: string;
    pain_point: string;
    product_focus: string;
  };
  strategies: {
    name: string;
    description: string;
    psychological_trigger: string;
  }[];
}

export interface TimelineSegment {
  sequence_id: number;
  segment_type: "Hook" | "Body" | "CTA";
  visual_prompt: string;
  start_time: number;
  duration: number;
  text_overlay: {
    content: string;
    position: "center" | "bottom" | "top";
    style: "big_bold" | "subtle";
  };
  transition: "fade" | "cut" | "zoom";
  generated_image?: string;
  is_generating_image?: boolean;
}

export interface VideoPlan {
  project_title: string;
  aspect_ratio: string;
  total_duration_sec: number;
  background_music_keyword: string;
  timeline: TimelineSegment[];
}

// Extend global definitions
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
}