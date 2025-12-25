'use client';

import { useState, useEffect } from 'react';

interface InterviewTemplate {
  _id?: string;
  name: string;
  description: string;
  type: 'technical' | 'behavioral' | 'mixed';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  skills: string[];
  questionCount: number;
  autoGenerate: boolean;
  customQuestions: Array<{
    question: string;
    expectedAnswer?: string;
    timeLimit: string;
    assessmentCriteria: string[];
  }>;
  createdBy?: string;
  isDefault?: boolean;
}

interface ConfigurationSettings {
  defaultDuration: number;
  defaultDifficulty: 'beginner' | 'intermediate' | 'advanced';
  autoGenerateQuestions: boolean;
  aiAssistanceEnabled: boolean;
  recordInterviews: boolean;
  allowCandidateRescheduling: boolean;
  notificationPreferences: {
    emailReminders: boolean;
    smsReminders: boolean;
    beforeInterviewHours: number;
  };
}

export default function InterviewConfigurationInterface() {
  const [activeTab, setActiveTab] = useState<'templates' | 'settings' | 'skills'>('templates');
  const [templates, setTemplates] = useState<InterviewTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<InterviewTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [availableSkills, setAvailableSkills] = useState<string[]>([]);
  const [configuration, setConfiguration] = useState<ConfigurationSettings>({
    defaultDuration: 30,
    defaultDifficulty: 'intermediate',
    autoGenerateQuestions: true,
    aiAssistanceEnabled: true,
    recordInterviews: false,
    allowCandidateRescheduling: true,
    notificationPreferences: {
      emailReminders: true,
      smsReminders: false,
      beforeInterviewHours: 24
    }
  });

  // Load data on component mount
  useEffect(() => {
    loadTemplates();
    loadSkills();
    loadConfiguration();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/interviewer/templates');
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates || []);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const loadSkills = async () => {
    try {
      const response = await fetch('/api/skills');
      if (response.ok) {
        const data = await response.json();
        setAvailableSkills(data.map((skill: any) => skill.name));
      }
    } catch (error) {
      console.error('Error loading skills:', error);
      // Fallback skills
      setAvailableSkills(['JavaScript', 'React', 'Node.js', 'Python', 'Java', 'SQL', 'AWS', 'Docker']);
    }
  };

  const loadConfiguration = async () => {
    try {
      const response = await fetch('/api/interviewer/configuration');
      if (response.ok) {
        const data = await response.json();
        setConfiguration(prev => ({ ...prev, ...data }));
      }
    } catch (error) {
      console.error('Error loading configuration:', error);
    }
  };

  const saveTemplate = async (template: InterviewTemplate) => {
    try {
      const url = template._id ? `/api/interviewer/templates/${template._id}` : '/api/interviewer/templates';
      const method = template._id ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(template)
      });

      if (response.ok) {
        loadTemplates();
        setIsCreating(false);
        setIsEditing(false);
        setSelectedTemplate(null);
      }
    } catch (error) {
      console.error('Error saving template:', error);
    }
  };

  const deleteTemplate = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    
    try {
      const response = await fetch(`/api/interviewer/templates/${templateId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        loadTemplates();
        setSelectedTemplate(null);
      }
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  };

  const saveConfiguration = async () => {
    try {
      const response = await fetch('/api/interviewer/configuration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(configuration)
      });

      if (response.ok) {
        alert('Configuration saved successfully!');
      }
    } catch (error) {
      console.error('Error saving configuration:', error);
    }
  };

  const createNewTemplate = (): InterviewTemplate => ({
    name: '',
    description: '',
    type: 'technical',
    difficulty: 'intermediate',
    duration: 30,
    skills: [],
    questionCount: 5,
    autoGenerate: true,
    customQuestions: []
  });

  const addCustomQuestion = (template: InterviewTemplate) => {
    return {
      ...template,
      customQuestions: [...template.customQuestions, {
        question: '',
        expectedAnswer: '',
        timeLimit: '3',
        assessmentCriteria: ['technical_accuracy']
      }]
    };
  };

  const removeCustomQuestion = (template: InterviewTemplate, index: number) => {
    return {
      ...template,
      customQuestions: template.customQuestions.filter((_, i) => i !== index)
    };
  };

  const updateCustomQuestion = (template: InterviewTemplate, index: number, field: string, value: string) => {
    const updatedQuestions = [...template.customQuestions];
    (updatedQuestions[index] as any)[field] = value;
    return {
      ...template,
      customQuestions: updatedQuestions
    };
  };

  const TemplateForm = ({ template, onSave, onCancel }: {
    template: InterviewTemplate;
    onSave: (template: InterviewTemplate) => void;
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState(template);

    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">
          {template._id ? 'Edit Template' : 'Create New Template'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Template Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="e.g., Senior Frontend Developer"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Interview Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="technical">Technical</option>
              <option value="behavioral">Behavioral</option>
              <option value="mixed">Mixed</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
            <select
              value={formData.difficulty}
              onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
            <input
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              min="15"
              max="120"
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            rows={3}
            placeholder="Template description..."
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.skills.map((skill, index) => (
              <span
                key={index}
                className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center space-x-1"
              >
                <span>{skill}</span>
                <button
                  onClick={() => setFormData({
                    ...formData,
                    skills: formData.skills.filter((_, i) => i !== index)
                  })}
                  className="text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <select
            onChange={(e) => {
              if (e.target.value && !formData.skills.includes(e.target.value)) {
                setFormData({
                  ...formData,
                  skills: [...formData.skills, e.target.value]
                });
              }
              e.target.value = '';
            }}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="">Select a skill to add</option>
            {availableSkills.map(skill => (
              <option key={skill} value={skill}>{skill}</option>
            ))}
          </select>
        </div>

        <div className="mb-6 flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.autoGenerate}
              onChange={(e) => setFormData({ ...formData, autoGenerate: e.target.checked })}
              className="mr-2"
            />
            Auto-generate questions with AI
          </label>
          
          {formData.autoGenerate && (
            <div>
              <label className="text-sm text-gray-600 mr-2">Question Count:</label>
              <input
                type="number"
                value={formData.questionCount}
                onChange={(e) => setFormData({ ...formData, questionCount: parseInt(e.target.value) })}
                className="border border-gray-300 rounded px-2 py-1 w-16"
                min="1"
                max="20"
              />
            </div>
          )}
        </div>

        {!formData.autoGenerate && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium">Custom Questions</h4>
              <button
                onClick={() => setFormData(addCustomQuestion(formData))}
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
              >
                Add Question
              </button>
            </div>
            
            {formData.customQuestions.map((question, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 mb-3">
                <div className="flex justify-between items-start mb-3">
                  <h5 className="font-medium">Question {index + 1}</h5>
                  <button
                    onClick={() => setFormData(removeCustomQuestion(formData, index))}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
                
                <textarea
                  value={question.question}
                  onChange={(e) => setFormData(updateCustomQuestion(formData, index, 'question', e.target.value))}
                  placeholder="Enter your question here..."
                  className="w-full border border-gray-300 rounded px-3 py-2 mb-3"
                  rows={2}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={question.expectedAnswer || ''}
                    onChange={(e) => setFormData(updateCustomQuestion(formData, index, 'expectedAnswer', e.target.value))}
                    placeholder="Expected answer (optional)"
                    className="border border-gray-300 rounded px-3 py-2"
                  />
                  
                  <select
                    value={question.timeLimit}
                    onChange={(e) => setFormData(updateCustomQuestion(formData, index, 'timeLimit', e.target.value))}
                    className="border border-gray-300 rounded px-3 py-2"
                  >
                    <option value="2">2 minutes</option>
                    <option value="3">3 minutes</option>
                    <option value="5">5 minutes</option>
                    <option value="10">10 minutes</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(formData)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Save Template
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Interview Configuration</h1>
      
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {[
            { id: 'templates', label: 'Templates', icon: '📋' },
            { id: 'settings', label: 'Settings', icon: '⚙️' },
            { id: 'skills', label: 'Skills', icon: '🎯' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div>
          {!isCreating && !isEditing ? (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Interview Templates</h2>
                <button
                  onClick={() => {
                    setSelectedTemplate(createNewTemplate());
                    setIsCreating(true);
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Create New Template
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map((template) => (
                  <div key={template._id} className="bg-white p-6 rounded-lg shadow border">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-semibold text-lg">{template.name}</h3>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedTemplate(template);
                            setIsEditing(true);
                          }}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => deleteTemplate(template._id!)}
                          className="text-red-600 hover:text-red-800"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4">{template.description}</p>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Type:</span>
                        <span className="capitalize">{template.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Difficulty:</span>
                        <span className="capitalize">{template.difficulty}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Duration:</span>
                        <span>{template.duration} min</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Questions:</span>
                        <span>{template.autoGenerate ? `${template.questionCount} (AI)` : template.customQuestions.length}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <div className="flex flex-wrap gap-1">
                        {template.skills.slice(0, 3).map((skill, index) => (
                          <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                            {skill}
                          </span>
                        ))}
                        {template.skills.length > 3 && (
                          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                            +{template.skills.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <TemplateForm
              template={selectedTemplate!}
              onSave={saveTemplate}
              onCancel={() => {
                setIsCreating(false);
                setIsEditing(false);
                setSelectedTemplate(null);
              }}
            />
          )}
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-6">Interviewer Settings</h2>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Interview Duration (minutes)
                </label>
                <input
                  type="number"
                  value={configuration.defaultDuration}
                  onChange={(e) => setConfiguration({
                    ...configuration,
                    defaultDuration: parseInt(e.target.value)
                  })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  min="15"
                  max="120"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Difficulty Level
                </label>
                <select
                  value={configuration.defaultDifficulty}
                  onChange={(e) => setConfiguration({
                    ...configuration,
                    defaultDifficulty: e.target.value as any
                  })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Features</h3>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={configuration.autoGenerateQuestions}
                  onChange={(e) => setConfiguration({
                    ...configuration,
                    autoGenerateQuestions: e.target.checked
                  })}
                  className="mr-3"
                />
                <span>Auto-generate questions using AI by default</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={configuration.aiAssistanceEnabled}
                  onChange={(e) => setConfiguration({
                    ...configuration,
                    aiAssistanceEnabled: e.target.checked
                  })}
                  className="mr-3"
                />
                <span>Enable AI assistance during interviews</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={configuration.recordInterviews}
                  onChange={(e) => setConfiguration({
                    ...configuration,
                    recordInterviews: e.target.checked
                  })}
                  className="mr-3"
                />
                <span>Record interviews by default</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={configuration.allowCandidateRescheduling}
                  onChange={(e) => setConfiguration({
                    ...configuration,
                    allowCandidateRescheduling: e.target.checked
                  })}
                  className="mr-3"
                />
                <span>Allow candidates to reschedule interviews</span>
              </label>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Notification Preferences</h3>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={configuration.notificationPreferences.emailReminders}
                  onChange={(e) => setConfiguration({
                    ...configuration,
                    notificationPreferences: {
                      ...configuration.notificationPreferences,
                      emailReminders: e.target.checked
                    }
                  })}
                  className="mr-3"
                />
                <span>Send email reminders</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={configuration.notificationPreferences.smsReminders}
                  onChange={(e) => setConfiguration({
                    ...configuration,
                    notificationPreferences: {
                      ...configuration.notificationPreferences,
                      smsReminders: e.target.checked
                    }
                  })}
                  className="mr-3"
                />
                <span>Send SMS reminders</span>
              </label>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Send reminders (hours before interview)
                </label>
                <input
                  type="number"
                  value={configuration.notificationPreferences.beforeInterviewHours}
                  onChange={(e) => setConfiguration({
                    ...configuration,
                    notificationPreferences: {
                      ...configuration.notificationPreferences,
                      beforeInterviewHours: parseInt(e.target.value)
                    }
                  })}
                  className="w-32 border border-gray-300 rounded-lg px-3 py-2"
                  min="1"
                  max="72"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={saveConfiguration}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Skills Tab */}
      {activeTab === 'skills' && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-6">Skill Management</h2>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-4">Available Skills</h3>
            <div className="flex flex-wrap gap-2">
              {availableSkills.map((skill, index) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
          
          <div className="text-sm text-gray-600">
            <p>Skills are managed globally. Contact your administrator to add or modify available skills.</p>
          </div>
        </div>
      )}
    </div>
  );
}
