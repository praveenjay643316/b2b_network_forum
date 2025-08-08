import React, { useEffect, useState } from 'react';
import Axios from '../../utils/axios';
import SummaryApi from '../../common/Summaryapi';
import { toast } from 'react-toastify';
import { MdImage, MdOutlineRampLeft, MdSnippetFolder } from 'react-icons/md';
import ShowImageGallery from './ShowImageGallery';

const ChatField = ({ handleSendMessage, setNewMessage, newMessage, handleKeyPress,sendTemplate,sendImage }) => {
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [showAttachment, setShowAttachment] = useState(false);
  const [showImageGallery, setShowImageGallery] = useState(false);



   const [templates, setTemplates] = useState([]);
   const [templatesLoading, setTemplatesLoading] = useState(false);

    // Fetch templates from backend
    const fetchTemplates = async () => {
        setTemplatesLoading(true);
        try {
            const response = await Axios({
                ...SummaryApi.get_templates,
            });

            if (response.data.success) {
                setTemplates(response.data.data);
            } else {
                toast.error('Failed to fetch templates', { autoClose: 3000 });
            }
        } catch (error) {
            console.error('❌ Error fetching templates:', error);
            toast.error('Error fetching templates', { autoClose: 3000 });
        } finally {
            setTemplatesLoading(false);
        }
    };

    // Fetch templates on component mount
    useEffect(() => {
        fetchTemplates();
    }, []);

  return (
    <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e1f2d]">
      <div className="flex items-center gap-3 flex-wrap relative">
        
        {/* Attachment Button + Menu */}
        <div className="relative">
          <button
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
            onClick={() => setShowAttachmentMenu(prev => !prev)}
          >
            <MdSnippetFolder size={20}/>
          </button>

          {showAttachmentMenu && (
            <div className="absolute left-14 bottom-0 bg-white dark:bg-gray-800 shadow-lg rounded w-48 z-50 border border-gray-200 dark:border-gray-600">
              <ul className="py-2 text-sm text-gray-700 dark:text-gray-200">
                {templates.map((template,index) =>(
                     <li>
                  <button
                    onClick={() => sendTemplate(template.template_name, template.lang)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {template.display_name}
                  </button>
                </li>
                ))}
               
              </ul>
            </div>
          )}
        </div>

        {/* Message Input */}
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1 min-w-[150px] px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-full bg-white dark:bg-darkinfo text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Type a message..."
        />

        {/* Emoji Button */}
        <button 
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
        onClick={() => setShowAttachment(prev => !prev)}
        >
          <MdImage size={20}/>
        </button>

        {showAttachment && (
            <div className="absolute right-32 bottom-0 bg-white dark:bg-gray-800 shadow-lg rounded w-48 z-50 border border-gray-200 dark:border-gray-600">
              <ul className="py-2 text-sm text-gray-700 dark:text-gray-200">
                     <li>
                  <button
                  onClick={()=>setShowImageGallery(prev => !prev)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Images
                  </button>
                </li>
              </ul>
            </div>
          )}

        {/* Send Button */}
        <button
          onClick={handleSendMessage}
          disabled={!newMessage.trim()}
          className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </div>
      {showImageGallery && <ShowImageGallery setShowImageGallery={setShowImageGallery} setShowAttachment={setShowAttachment} sendImage={sendImage}/>}
    </div>
  );
};

export default ChatField;
