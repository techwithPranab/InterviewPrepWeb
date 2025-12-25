'use client';

import React, { useState } from 'react';
import { Share2, Twitter, Linkedin, Facebook, Link2, Check, Copy } from 'lucide-react';

interface SocialShareProps {
  sessionId: string;
  title: string;
  score: number;
  skills: string[];
}

export const SocialShare: React.FC<SocialShareProps> = ({
  sessionId,
  title,
  score,
  skills
}) => {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = `${window.location.origin}/interview/share/${sessionId}`;
  const shareText = `I just completed "${title}" interview and scored ${score}/10! 🎯\n\nSkills: ${skills.join(', ')}\n\nCheck out my performance:`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
  };

  const handleLinkedInShare = () => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(linkedInUrl, '_blank', 'width=600,height=600');
  };

  const handleFacebookShare = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowShareMenu(!showShareMenu)}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
      >
        <Share2 className="w-4 h-4" />
        Share Results
      </button>

      {showShareMenu && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowShareMenu(false)}
          />

          {/* Share Menu */}
          <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
            <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-1">Share Your Achievement</h3>
              <p className="text-sm text-gray-600">Let others know about your progress!</p>
            </div>

            <div className="p-3 space-y-2">
              {/* Copy Link */}
              <button
                onClick={handleCopyLink}
                className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left group"
              >
                {copied ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : (
                  <Copy className="w-5 h-5 text-gray-600 group-hover:text-gray-900" />
                )}
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {copied ? 'Link Copied!' : 'Copy Link'}
                  </div>
                  <div className="text-xs text-gray-500">Share anywhere</div>
                </div>
              </button>

              {/* Twitter */}
              <button
                onClick={handleTwitterShare}
                className="w-full flex items-center gap-3 px-4 py-3 bg-sky-50 hover:bg-sky-100 rounded-lg transition-colors text-left group"
              >
                <Twitter className="w-5 h-5 text-sky-600" />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">Twitter</div>
                  <div className="text-xs text-gray-500">Share on Twitter</div>
                </div>
              </button>

              {/* LinkedIn */}
              <button
                onClick={handleLinkedInShare}
                className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-left group"
              >
                <Linkedin className="w-5 h-5 text-blue-600" />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">LinkedIn</div>
                  <div className="text-xs text-gray-500">Share on LinkedIn</div>
                </div>
              </button>

              {/* Facebook */}
              <button
                onClick={handleFacebookShare}
                className="w-full flex items-center gap-3 px-4 py-3 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors text-left group"
              >
                <Facebook className="w-5 h-5 text-indigo-600" />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">Facebook</div>
                  <div className="text-xs text-gray-500">Share on Facebook</div>
                </div>
              </button>
            </div>

            <div className="p-3 bg-gray-50 border-t border-gray-200">
              <div className="text-xs text-gray-500 mb-2">Preview Link:</div>
              <div className="flex items-center gap-2 p-2 bg-white rounded border border-gray-200">
                <Link2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <div className="text-xs text-gray-600 truncate">{shareUrl}</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
