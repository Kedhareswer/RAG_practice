'use client';

import React from 'react';

interface MarkdownRendererProps {
  content: string;
  citations?: Array<{
    id: number;
    source: string;
    page?: number;
    content: string;
    relevanceScore?: number;
  }>;
}

export default function MarkdownRenderer({ content, citations = [] }: MarkdownRendererProps) {
  const renderContent = () => {
    // Split content into lines
    const lines = content.split('\n');
    const elements: JSX.Element[] = [];
    let listItems: string[] = [];
    let inCodeBlock = false;
    let codeLines: string[] = [];
    let codeLanguage = '';

    const flushList = () => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={`list-${elements.length}`} className="list-disc list-inside space-y-1 my-2">
            {listItems.map((item, idx) => (
              <li key={idx} className="text-gray-200">{parseInlineFormatting(item)}</li>
            ))}
          </ul>
        );
        listItems = [];
      }
    };

    const flushCodeBlock = () => {
      if (codeLines.length > 0) {
        elements.push(
          <pre key={`code-${elements.length}`} className="bg-gray-800 rounded-lg p-4 my-3 overflow-x-auto">
            <code className="text-sm text-gray-100 font-mono">
              {codeLines.join('\n')}
            </code>
          </pre>
        );
        codeLines = [];
        codeLanguage = '';
      }
    };

    lines.forEach((line, index) => {
      // Code blocks
      if (line.trim().startsWith('```')) {
        if (inCodeBlock) {
          flushCodeBlock();
          inCodeBlock = false;
        } else {
          flushList();
          inCodeBlock = true;
          codeLanguage = line.trim().substring(3);
        }
        return;
      }

      if (inCodeBlock) {
        codeLines.push(line);
        return;
      }

      // Bullet points
      if (line.trim().match(/^[-*•]\s+/)) {
        const text = line.trim().replace(/^[-*•]\s+/, '');
        listItems.push(text);
        return;
      }

      // Numbered lists
      if (line.trim().match(/^\d+\.\s+/)) {
        flushList();
        const text = line.trim().replace(/^\d+\.\s+/, '');
        elements.push(
          <div key={`num-${index}`} className="flex gap-2 my-1">
            <span className="text-gray-400">{line.match(/^\d+/)?.[0]}.</span>
            <span className="text-gray-200">{parseInlineFormatting(text)}</span>
          </div>
        );
        return;
      }

      flushList();

      // Headers
      if (line.startsWith('###')) {
        elements.push(
          <h3 key={`h3-${index}`} className="text-lg font-semibold text-gray-100 mt-4 mb-2">
            {parseInlineFormatting(line.replace(/^###\s*/, ''))}
          </h3>
        );
      } else if (line.startsWith('##')) {
        elements.push(
          <h2 key={`h2-${index}`} className="text-xl font-bold text-gray-100 mt-5 mb-3">
            {parseInlineFormatting(line.replace(/^##\s*/, ''))}
          </h2>
        );
      } else if (line.startsWith('#')) {
        elements.push(
          <h1 key={`h1-${index}`} className="text-2xl font-bold text-gray-100 mt-6 mb-3">
            {parseInlineFormatting(line.replace(/^#\s*/, ''))}
          </h1>
        );
      } else if (line.trim() === '') {
        // Empty line - add spacing
        if (elements.length > 0) {
          elements.push(<div key={`space-${index}`} className="h-2" />);
        }
      } else {
        // Regular paragraph
        elements.push(
          <p key={`p-${index}`} className="text-gray-200 leading-relaxed my-2">
            {parseInlineFormatting(line)}
          </p>
        );
      }
    });

    flushList();
    flushCodeBlock();

    return elements;
  };

  const parseInlineFormatting = (text: string): React.ReactNode => {
    const parts: React.ReactNode[] = [];
    let currentText = text;
    let key = 0;

    // Parse inline code first
    const codeRegex = /`([^`]+)`/g;
    let lastIndex = 0;
    let match;

    while ((match = codeRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(parseTextFormatting(text.substring(lastIndex, match.index), key++));
      }
      parts.push(
        <code key={`code-${key++}`} className="bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono text-blue-300">
          {match[1]}
        </code>
      );
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push(parseTextFormatting(text.substring(lastIndex), key++));
    }

    return parts.length > 0 ? parts : text;
  };

  const parseTextFormatting = (text: string, baseKey: number): React.ReactNode => {
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let key = baseKey;

    // Bold (**text** or __text__)
    const boldRegex = /(\*\*|__)(.*?)\1/g;
    let lastIndex = 0;
    let match;

    while ((match = boldRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(parseItalic(text.substring(lastIndex, match.index), key++));
      }
      parts.push(
        <strong key={`bold-${key++}`} className="font-semibold text-gray-100">
          {match[2]}
        </strong>
      );
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push(parseItalic(text.substring(lastIndex), key++));
    }

    return parts.length > 0 ? parts : text;
  };

  const parseItalic = (text: string, baseKey: number): React.ReactNode => {
    const parts: React.ReactNode[] = [];
    const italicRegex = /(\*|_)(.*?)\1/g;
    let lastIndex = 0;
    let match;

    while ((match = italicRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(<span key={`text-${baseKey++}`}>{text.substring(lastIndex, match.index)}</span>);
      }
      parts.push(
        <em key={`italic-${baseKey++}`} className="italic text-gray-300">
          {match[2]}
        </em>
      );
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push(<span key={`text-${baseKey++}`}>{text.substring(lastIndex)}</span>);
    }

    return parts.length > 0 ? parts : text;
  };

  return (
    <div className="prose prose-invert max-w-none">
      {renderContent()}
    </div>
  );
}
