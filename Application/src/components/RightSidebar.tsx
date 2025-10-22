'use client';

import { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Settings, 
  Key, 
  Sliders, 
  FileText,
  Brain,
  Save,
  RotateCcw
} from 'lucide-react';
import { AppSettings, GEMINI_MODELS } from '@/types';

interface RightSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  settings: AppSettings;
  onSettingsChange: (settings: AppSettings) => void;
  apiKey: string;
  onApiKeyChange: (key: string) => void;
}

const DEFAULT_SYSTEM_PROMPT = `You are an intelligent assistant that answers questions based on the provided context from uploaded documents.

Instructions:
1. Use ONLY the information provided in the context to answer questions
2. If the context doesn't contain sufficient information, clearly state: "The information is not available in the provided documents"
3. Be precise and cite specific sources when possible
4. Maintain a helpful and professional tone
5. If multiple sources provide conflicting information, acknowledge this and present both perspectives

Context will be provided below each question.`;

export default function RightSidebar({
  isCollapsed,
  onToggle,
  settings,
  onSettingsChange,
  apiKey,
  onApiKeyChange
}: RightSidebarProps) {
  const [activeTab, setActiveTab] = useState<'api' | 'model' | 'rag' | 'system'>('api');
  const [tempSettings, setTempSettings] = useState(settings);
  const [tempApiKey, setTempApiKey] = useState(apiKey);

  const handleSave = () => {
    onSettingsChange(tempSettings);
    onApiKeyChange(tempApiKey);
  };

  const handleReset = () => {
    setTempSettings({
      ...settings,
      systemPrompt: DEFAULT_SYSTEM_PROMPT,
      model: 'gemini-2.5-flash',
      temperature: 0.3,
      maxTokens: 2048,
      topK: 4,
      chunkSize: 1000,
      chunkOverlap: 200,
      showMetrics: true,
      autoSave: true
    });
  };

  const updateSetting = (key: keyof AppSettings, value: any) => {
    setTempSettings(prev => ({ ...prev, [key]: value }));
  };

  if (isCollapsed) {
    return (
      <div className="w-16 bg-gray-50 border-l border-gray-200 flex flex-col items-center py-4">
        <button
          onClick={onToggle}
          className="p-2 hover:bg-gray-200 rounded-lg transition-colors mb-4"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <div className="space-y-2">
          <button
            onClick={() => setActiveTab('api')}
            className={`p-2 rounded-lg transition-colors ${
              activeTab === 'api' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-200'
            }`}
          >
            <Key className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => setActiveTab('model')}
            className={`p-2 rounded-lg transition-colors ${
              activeTab === 'model' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-200'
            }`}
          >
            <Brain className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => setActiveTab('rag')}
            className={`p-2 rounded-lg transition-colors ${
              activeTab === 'rag' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-200'
            }`}
          >
            <Sliders className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => setActiveTab('system')}
            className={`p-2 rounded-lg transition-colors ${
              activeTab === 'system' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-200'
            }`}
          >
            <FileText className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-gray-50 border-l border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="font-semibold text-gray-800">Settings</h2>
        <button
          onClick={onToggle}
          className="p-1 hover:bg-gray-200 rounded transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap border-b border-gray-200">
        <button
          onClick={() => setActiveTab('api')}
          className={`flex-1 min-w-0 px-2 py-2 text-xs font-medium transition-colors ${
            activeTab === 'api'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Key className="w-3 h-3 inline mr-1" />
          API
        </button>
        
        <button
          onClick={() => setActiveTab('model')}
          className={`flex-1 min-w-0 px-2 py-2 text-xs font-medium transition-colors ${
            activeTab === 'model'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Brain className="w-3 h-3 inline mr-1" />
          Model
        </button>
        
        <button
          onClick={() => setActiveTab('rag')}
          className={`flex-1 min-w-0 px-2 py-2 text-xs font-medium transition-colors ${
            activeTab === 'rag'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Sliders className="w-3 h-3 inline mr-1" />
          RAG
        </button>
        
        <button
          onClick={() => setActiveTab('system')}
          className={`flex-1 min-w-0 px-2 py-2 text-xs font-medium transition-colors ${
            activeTab === 'system'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <FileText className="w-3 h-3 inline mr-1" />
          System
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'api' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Google Gemini API Key
              </label>
              <input
                type="password"
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
                placeholder="Enter your API key"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                Get your key from{' '}
                <a
                  href="https://makersuite.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Google AI Studio
                </a>
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="autoSave"
                checked={tempSettings.autoSave}
                onChange={(e) => updateSetting('autoSave', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="autoSave" className="text-sm text-gray-700">
                Auto-save settings
              </label>
            </div>
          </div>
        )}

        {activeTab === 'model' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Model Selection
              </label>
              <select
                value={tempSettings.model}
                onChange={(e) => updateSetting('model', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                {GEMINI_MODELS.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {GEMINI_MODELS.find(m => m.id === tempSettings.model)?.description}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Temperature: {tempSettings.temperature}
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={tempSettings.temperature}
                onChange={(e) => updateSetting('temperature', parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Focused</span>
                <span>Creative</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Tokens
              </label>
              <input
                type="number"
                min="256"
                max="8192"
                value={tempSettings.maxTokens}
                onChange={(e) => updateSetting('maxTokens', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                Maximum length of generated responses
              </p>
            </div>
          </div>
        )}

        {activeTab === 'rag' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Top K Sources: {tempSettings.topK}
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={tempSettings.topK}
                onChange={(e) => updateSetting('topK', parseInt(e.target.value))}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                Number of most relevant sources to use
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chunk Size
              </label>
              <input
                type="number"
                min="500"
                max="2000"
                step="100"
                value={tempSettings.chunkSize}
                onChange={(e) => updateSetting('chunkSize', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chunk Overlap
              </label>
              <input
                type="number"
                min="0"
                max="500"
                step="50"
                value={tempSettings.chunkOverlap}
                onChange={(e) => updateSetting('chunkOverlap', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="showMetrics"
                checked={tempSettings.showMetrics}
                onChange={(e) => updateSetting('showMetrics', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="showMetrics" className="text-sm text-gray-700">
                Show performance metrics
              </label>
            </div>
          </div>
        )}

        {activeTab === 'system' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                System Prompt
              </label>
              <textarea
                value={tempSettings.systemPrompt}
                onChange={(e) => updateSetting('systemPrompt', e.target.value)}
                rows={12}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                placeholder="Enter system prompt..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Instructions for how the AI should behave and respond
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        <button
          onClick={handleSave}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>Save Settings</span>
        </button>
        
        <button
          onClick={handleReset}
          className="w-full px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset to Defaults</span>
        </button>
      </div>
    </div>
  );
}
