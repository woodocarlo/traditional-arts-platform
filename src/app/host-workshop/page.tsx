"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { VideoCameraIcon } from '../../components/icons'; // Assuming this icon is properly defined

interface Workshop {
  id: string;
  title: string;
  description: string;
  date: string;
  duration: string;
  price: string;
  type: string;
  platform: string;
  image: string;
}

const HostWorkshopPage = () => {
  const router = useRouter();
  const [workshops, setWorkshops] = useState<Workshop[]>([
    {
      id: '1',
      title: 'Mastering Watercolor Landscapes',
      description: 'Learn fundamental techniques for creating vibrant and expressive watercolor landscapes. Perfect for intermediate artists looking to refine their skills.',
      date: '2023-11-15',
      duration: '3 hours',
      price: '25',
      type: 'Teaching',
      platform: 'Zoom',
      image: 'https://images.unsplash.com/photo-1610492934078-de91a92e1c9d?q=80&w=400&auto=format&fit=crop',
    },
    {
      id: '2',
      title: 'Introduction to Digital Art with Procreate',
      description: 'Discover the basics of digital illustration using Procreate on iPad. We’ll cover brushes, layers, and essential tools to get you started.',
      date: '2023-12-01',
      duration: '2 hours',
      price: 'Free',
      type: 'Interactive',
      platform: 'YouTube Live',
      image: 'https://images.unsplash.com/photo-1549298370-360b94098939?q=80&w=400&auto=format&fit=crop',
    },
    {
      id: '3',
      title: 'Product Photography for Small Businesses',
      description: 'Elevate your product visuals! This workshop teaches lighting, composition, and editing tips to make your products shine without expensive equipment.',
      date: '2024-01-10',
      duration: '2.5 hours',
      price: '40',
      type: 'Product Display',
      platform: 'Google Meet',
      image: 'https://images.unsplash.com/photo-151748680-e2b292e07974?q=80&w=400&auto=format&fit=crop',
    },
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWorkshopId, setEditingWorkshopId] = useState<string | null>(null); // To track which workshop is being edited
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [workshopToDelete, setWorkshopToDelete] = useState<string | null>(null);
  const [newWorkshop, setNewWorkshop] = useState({
    title: '',
    description: '',
    date: '',
    duration: '',
    price: 'Free',
    type: 'Teaching',
    platform: 'YouTube Live',
    image: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewWorkshop((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewWorkshop((prev) => ({ ...prev, image: reader.result as string })); // Store as base64 for demo
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateOrUpdateWorkshop = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (editingWorkshopId) {
      setWorkshops((prev) =>
        prev.map((ws) => (ws.id === editingWorkshopId ? { ...newWorkshop, id: ws.id } : ws))
      );
      setEditingWorkshopId(null);
    } else {
      setWorkshops((prev) => [...prev, { ...newWorkshop, id: Date.now().toString() }]);
    }
    setNewWorkshop({
      title: '',
      description: '',
      date: '',
      duration: '',
      price: 'Free',
      type: 'Teaching',
      platform: 'YouTube Live',
      image: '',
    });
    setIsModalOpen(false);
  };

  const handleDeleteWorkshop = (id: string) => {
    setWorkshopToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (workshopToDelete !== null) {
      setWorkshops((prev) => prev.filter((ws) => ws.id !== workshopToDelete));
      setWorkshopToDelete(null);
    }
    setIsDeleteModalOpen(false);
  };

  const handleEditWorkshop = (workshop: Workshop) => {
    setEditingWorkshopId(workshop.id);
    setNewWorkshop(workshop); // Populate modal with existing workshop data
    setIsModalOpen(true);
  };

  const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
    <div className="bg-white rounded-2xl p-6 shadow-xl border-t-4 border-amber-500 transform transition duration-300 hover:scale-105 hover:shadow-2xl">
      <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4 mx-auto">
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">{title}</h3>
      <p className="text-gray-600 text-center">{description}</p>
    </div>
  );

  const WorkshopCard = ({ workshop }: { workshop: Workshop }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
      <div className="bg-white rounded-2xl shadow-lg border border-amber-200 overflow-hidden cursor-pointer hover:shadow-xl transition-shadow duration-300">
        <div className="relative w-full h-48 bg-gray-100">
          <Image
            src={workshop.image || "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=400&auto=format&fit=crop"}
            alt={workshop.title || "Workshop preview"}
            layout="fill"
            objectFit="cover"
            className="rounded-t-2xl"
          />
        </div>
        <div className="p-6">
          <h3 className="text-2xl font-extrabold text-gray-900 mb-2 leading-tight">{workshop.title || "Untitled Workshop"}</h3>
          <p className="text-sm text-amber-600 font-semibold mb-4">
            {workshop.date} &bull; {workshop.duration} &bull; {workshop.platform}
          </p>

          {!isExpanded && (
            <button
              onClick={() => setIsExpanded(true)}
              className="text-amber-700 hover:text-amber-900 text-sm font-medium flex items-center mt-2"
            >
              Learn More
              <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}

          {isExpanded && (
            <div className="mt-4 pt-4 border-t border-amber-100">
              <p className="text-gray-700 text-base mb-4 leading-relaxed">{workshop.description}</p>
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-4">
                <p><strong>Type:</strong> {workshop.type}</p>
                <p><strong>Price:</strong> {workshop.price === 'Free' ? 'Free' : `$${workshop.price}`}</p>
                <p><strong>Status:</strong> Live Soon</p>
              </div>
              <div className="flex space-x-3 mt-6">
                <button className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2 rounded-lg font-medium transition-colors flex-grow">
                  Manage Workshop
                </button>
                <button
                  onClick={() => handleEditWorkshop(workshop)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 p-2 rounded-lg font-medium transition-colors"
                  title="Edit"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDeleteWorkshop(workshop.id)}
                  className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg font-medium transition-colors"
                  title="Delete"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              <button
                 onClick={() => router.push('/AI_generation')}
                 className="mt-3 w-full bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                 Create Advertisement
              </button>
              <button
                onClick={() => setIsExpanded(false)}
                className="text-amber-700 hover:text-amber-900 text-sm font-medium flex items-center justify-center w-full mt-4"
              >
                Show Less
                <svg className="w-4 h-4 ml-1 transform rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-100">
      {/* Header */}
      <div className="bg-[#4D080F] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="mx-auto mb-6 h-16 w-16 text-amber-400">
            <VideoCameraIcon />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">
            Host a Workshop
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Organize and stream live webinars or tutorials directly to your followers.
            Share your expertise, build your community, and monetize your skills.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Enhanced Features Section */}
        <h2 className="text-4xl font-extrabold text-gray-900 mb-12 text-center">
          Empower Your Teaching Journey
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 mb-20">
          <FeatureCard
            icon={
              <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            }
            title="Seamless Live Streaming"
            description="Deliver high-quality workshops with integrated live video, chat, and interactive tools."
          />
          <FeatureCard
            icon={
              <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
            title="Engage Your Community"
            description="Foster connections, answer questions, and build a loyal audience around your unique skills."
          />
          <FeatureCard
            icon={
              <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            }
            title="Effortless Monetization"
            description="Offer paid workshops, subscriptions, or accept donations to support your creative work."
          />
        </div>

        {/* Dynamic Workshops Section */}
        <h2 className="text-4xl font-extrabold text-gray-900 mb-10 text-center">
          Your Workshops
        </h2>
        <div className="flex justify-center mb-10">
          <button
            onClick={() => {
              setEditingWorkshopId(null); // Ensure we're creating, not editing
              setNewWorkshop({ // Reset form for new workshop
                title: '',
                description: '',
                date: '',
                duration: '',
                price: 'Free',
                type: 'Teaching',
                platform: 'YouTube Live',
                image: '',
              });
              setIsModalOpen(true);
            }}
            className="bg-[#4D080F] hover:bg-[#3D060A] text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 shadow-md hover:shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Create New Workshop</span>
          </button>
        </div>

        {workshops.length === 0 ? (
          <p className="text-center text-gray-600 text-lg">You haven't created any workshops yet. Click "Create New Workshop" to get started!</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {workshops.map((workshop) => (
              <WorkshopCard key={workshop.id} workshop={workshop} />
            ))}
          </div>
        )}

        {/* Translucent Modal for Creating/Editing Workshop */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-8 shadow-2xl max-w-lg w-full transform scale-95 animate-scaleIn relative">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
                title="Close"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                {editingWorkshopId ? 'Edit Workshop' : 'Plan Your Workshop'}
              </h3>
              <form onSubmit={handleCreateOrUpdateWorkshop} className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">Workshop Title</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={newWorkshop.title}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-amber-500 focus:border-amber-500"
                    placeholder="e.g., Introduction to Digital Painting"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={newWorkshop.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-amber-500 focus:border-amber-500"
                    placeholder="What will participants learn?"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={newWorkshop.date}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-amber-500 focus:border-amber-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="duration" className="block text-sm font-medium text-gray-700">Duration (e.g., 2 hours)</label>
                    <input
                      type="text"
                      id="duration"
                      name="duration"
                      value={newWorkshop.duration}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-amber-500 focus:border-amber-500"
                      placeholder="e.g., 90 mins, 3 hours"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price</label>
                    <select
                      id="price"
                      name="price"
                      value={newWorkshop.price}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-amber-500 focus:border-amber-500"
                    >
                      <option value="Free">Free</option>
                      <option value="10">$10</option>
                      <option value="20">$20</option>
                      <option value="50">$50</option>
                      <option value="Custom">Custom Amount</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700">Workshop Type</label>
                    <select
                      id="type"
                      name="type"
                      value={newWorkshop.type}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-amber-500 focus:border-amber-500"
                    >
                      <option value="Teaching">Teaching/Tutorial</option>
                      <option value="Interactive">Interactive Session</option>
                      <option value="Product Display">Product Display</option>
                      <option value="Q&A">Q&A Session</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label htmlFor="platform" className="block text-sm font-medium text-gray-700">Streaming Platform</label>
                  <select
                    id="platform"
                    name="platform"
                    value={newWorkshop.platform}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-amber-500 focus:border-amber-500"
                  >
                    <option value="YouTube Live">YouTube Live</option>
                    <option value="Instagram Live">Instagram Live</option>
                    <option value="Google Meet">Google Meet</option>
                    <option value="Zoom">Zoom</option>
                    <option value="Custom URL">Custom Stream URL</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="imageUpload" className="block text-sm font-medium text-gray-700 mb-1">Workshop Cover Image</label>
                  <input
                    type="file"
                    id="imageUpload"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="block w-full text-sm text-gray-500
                               file:mr-4 file:py-2 file:px-4
                               file:rounded-full file:border-0
                               file:text-sm file:font-semibold
                               file:bg-amber-50 file:text-amber-700
                               hover:file:bg-amber-100"
                  />
                  {newWorkshop.image && (
                    <div className="mt-2 relative w-32 h-20">
                      <Image src={newWorkshop.image} alt="Workshop preview" layout="fill" objectFit="cover" className="rounded-md" />
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-1">Upload an image or paste a URL below.</p>
                  <input
                    type="text"
                    id="image"
                    name="image"
                    value={newWorkshop.image}
                    onChange={handleInputChange}
                    className="mt-2 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-amber-500 focus:border-amber-500"
                    placeholder="Or paste image URL here"
                  />
                </div>

                <div className="flex justify-end space-x-4 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    {editingWorkshopId ? 'Update Workshop' : 'Create Workshop'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="text-center mt-20">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-6">Ready to Inspire and Connect?</h2>
          <p className="text-xl text-gray-700 mb-10 max-w-3xl mx-auto leading-relaxed">
            Your expertise has value. Launch your first workshop today and transform your passion into a thriving community.
          </p>
          <Link href="/" className="inline-block bg-[#4D080F] hover:bg-[#3D060A] text-white px-10 py-4 rounded-lg font-medium transition-colors text-lg shadow-lg hover:shadow-xl">
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HostWorkshopPage;