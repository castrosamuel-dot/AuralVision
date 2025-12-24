'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { addDoc, collection } from 'firebase/firestore';
import { db, vertexAI } from '@/lib/firebase';
import { getGenerativeModel } from "firebase/ai";
import { ArrowLeft, Sparkles, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function NewPostPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [topic, setTopic] = useState('');
  const [category, setCategory] = useState('Event AV');
  const [tone, setTone] = useState('Professional');
  const [content, setContent] = useState(''); // Holds the Markdown
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/admin/login');
  }, [user, loading, router]);

  const handleGenerate = async () => {
    if (!topic) return alert('Please enter a topic');
    setIsGenerating(true);
    try {
      const model = getGenerativeModel(vertexAI, { model: "gemini-1.5-flash" });

      const prompt = `
      You are an expert Audio Visual technician, technology reviewer, and blogger for a site called "AuralVision".
      
      Write a comprehensive, engaging, and professional blog post about: "${topic}".
      Category: ${category}
      Tone: ${tone}

      Structure the response in Markdown format.
      Include:
      1. A catchy Title (h1).
      2. An engaging Introduction.
      3. Well-structured body paragraphs with subheadings (h2, h3).
      4. A Conclusion.
      5. A short "Excerpt" at the very end, labeled as "EXCERPT:".

      Do not include any preamble like "Here is the blog post". Just output the content.
      `;

      const result = await model.generateContent(prompt);
      const response = result.response;
      let generatedText = response.text();

      if (generatedText) {
        // Try to extract title (# Title)
        const titleMatch = generatedText.match(/^#\s+(.+)$/m);
        if (titleMatch) {
          setTitle(titleMatch[1]);
          generatedText = generatedText.replace(/^#\s+(.+)$/m, '').trim();
        }

        // Try to extract excerpt (EXCERPT: ...)
        const excerptMatch = generatedText.match(/EXCERPT:\s*(.+)$/s);
        if (excerptMatch) {
            setExcerpt(excerptMatch[1].trim());
            generatedText = generatedText.replace(/EXCERPT:\s*(.+)$/s, '').trim();
        }

        setContent(generatedText);
      }
    } catch (e: any) {
      console.error("Generation Error:", e);
      alert('Failed to generate content. Ensure Vertex AI API is enabled in Firebase Console.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async (published: boolean) => {
    if (!title || !content) return alert('Title and Content are required');
    setIsSaving(true);
    try {
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      await addDoc(collection(db, 'posts'), {
        title,
        slug,
        content,
        excerpt: excerpt || content.substring(0, 150) + '...',
        category,
        author: user?.email || 'Admin',
        createdAt: Date.now(),
        published,
        coverImage: null
      });
      router.push('/admin');
    } catch (e) {
      console.error(e);
      alert('Error saving post');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || !user) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/admin" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
      </Link>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: AI Controls */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Sparkles className="h-5 w-5 text-purple-500 mr-2" /> AI Writer (Vertex AI)
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Topic</label>
                <textarea 
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
                  placeholder="e.g. The future of LED walls in concert touring"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select 
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option>Event AV</option>
                  <option>Technology</option>
                  <option>Reviews</option>
                  <option>How-to</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Tone</label>
                <select 
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                >
                  <option>Professional</option>
                  <option>Casual</option>
                  <option>Technical</option>
                  <option>Enthusiastic</option>
                </select>
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
              >
                {isGenerating ? <Loader2 className="animate-spin h-4 w-4" /> : 'Draft with Gemini'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Editor */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
             <div className="mb-4">
               <label className="block text-sm font-medium text-gray-700">Post Title</label>
               <input 
                 type="text" 
                 className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-lg font-bold"
                 value={title}
                 onChange={(e) => setTitle(e.target.value)}
                 placeholder="Post Title..."
               />
             </div>

             <div className="mb-4">
               <label className="block text-sm font-medium text-gray-700">Slug (auto-generated on save)</label>
               <input 
                 type="text" 
                 disabled
                 className="mt-1 block w-full bg-gray-50 border border-gray-300 rounded-md shadow-sm p-2 text-sm text-gray-500"
                 value={title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}
               />
             </div>

             <div className="mb-4">
               <label className="block text-sm font-medium text-gray-700">Content (Markdown)</label>
               <textarea 
                 rows={15}
                 className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 font-mono text-sm"
                 value={content}
                 onChange={(e) => setContent(e.target.value)}
               />
             </div>

             <div className="mb-4">
               <label className="block text-sm font-medium text-gray-700">Excerpt</label>
               <textarea 
                 rows={3}
                 className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
                 value={excerpt}
                 onChange={(e) => setExcerpt(e.target.value)}
               />
             </div>

             <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
               <button
                 onClick={() => handleSave(false)}
                 disabled={isSaving}
                 className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
               >
                 Save Draft
               </button>
               <button
                 onClick={() => handleSave(true)}
                 disabled={isSaving}
                 className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
               >
                 <Save className="mr-2 h-4 w-4" />
                 Publish
               </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
