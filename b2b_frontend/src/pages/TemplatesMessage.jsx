import React, { useState, useEffect } from 'react';
import Axios from '../utils/axios';
import SummaryApi from '../common/Summaryapi';
import { toast } from 'react-toastify';
import PageHeader from '../components/utils/PageHeader';

const TemplateMessage = () => {
    const [data, setData] = useState({
        phone: '',
        template: '',
        lang: '',
    });
    const [loading, setLoading] = useState(false);
    const [templates, setTemplates] = useState([]);
    const [templatesLoading, setTemplatesLoading] = useState(false);

    // Fetch templates from backend
    const fetchTemplates = async () => {
        setTemplatesLoading(true);
        try {
            // Replace 'get_templates' with your actual API endpoint
            const response = await Axios({
                ...SummaryApi.get_templates, // Make sure this endpoint exists in your SummaryApi
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // If message template is selected, also update the language
        if (name === 'template') {
            const selectedTemplate = templates.find(template => template.template_name === value);
            setData((prev) => ({
                ...prev,
                [name]: value,
                lang: selectedTemplate ? selectedTemplate.lang : '',
            }));
        } else {
            setData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent page reload
        if(data.template === "" && data.phone === ""){
            toast.error(`Please enter number and message`, { autoClose: 2000 });
            return;
        }
        
        if(data.phone === ""){
            toast.error(`Please enter phone number(s)`, { autoClose: 2000 });
            return;
        }
        
        if(data.template === ""){
            toast.error(`Please select a message template`, { autoClose: 2000 });
            return;
        }

        const phoneNumbers = data.phone
            .split('\n')
            .map((num) => num.trim())
            .filter((num) => num !== '');

        setLoading(true);

        try {
            for (const phone of phoneNumbers) {
                const formData = new FormData();
                formData.append("number", phone);
                formData.append("template", data.template);
                formData.append("lang", data.lang);

                const response = await Axios({
                    ...SummaryApi.send_template,
                    data: formData
                });

                if (response.data.status === "success") {
                    console.log(`Sent to ${phone}:`, response.data);
                    toast.success(`Message sent to ${phone}`, { autoClose: 2000 });
                } else {
                    console.warn(`Failed to send to ${phone}:`, response.data);
                    toast.error(`Failed to send to ${phone}`, { autoClose: 3000 });
                }
            }
        } catch (error) {
            console.error('❌ Error while sending message:', error);
            toast.error('Error while sending messages', { autoClose: 3000 });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <PageHeader title="Template Message"/>
            <div className="p-2 bg-white dark:bg-darkinfo text-gray-900 dark:text-white h-[calc(100vh-190px)] rounded-lg overflow-hidden">
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 gap-6 mb-4">
                        {/* Phone Number Textarea */}
                        <div className="flex flex-col gap-2">
                            <label htmlFor="phone" className="text-sm font-medium">Phone Numbers</label>
                            <textarea
                                name="phone"
                                placeholder="Enter one number per line"
                                id="phone"
                                className="bg-transparent p-3 border border-primary focus:outline-none w-full min-h-[150px] rounded resize-vertical"
                                value={data.phone}
                                onChange={handleChange}
                            ></textarea>
                        </div>

                        {/* Template and Language Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Message Template Select */}
                            <div className="flex flex-col gap-2">
                                <label htmlFor="template" className="text-sm font-medium">Message Template</label>
                                <select
                                    name="template"
                                    id="template"
                                    className="bg-transparent p-3 border border-primary focus:outline-none w-full h-[50px] rounded"
                                    value={data.template}
                                    onChange={handleChange}
                                    disabled={templatesLoading}
                                >
                                    <option value="">
                                        {templatesLoading ? 'Loading templates...' : 'Select a template'}
                                    </option>
                                    {templates.map((template) => (
                                        <option key={template.id} value={template.template_name}>
                                            {template.display_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Language Input */}
                            <div className="flex flex-col gap-2">
                                <label htmlFor="lang" className="text-sm font-medium">Language</label>
                                <input
                                    name="lang"
                                    id="lang"
                                    type="text"
                                    className="bg-transparent p-3 border border-primary focus:outline-none w-full h-[50px] rounded"
                                    value={data.lang}
                                    placeholder="Language will appear here"
                                    readOnly
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={loading || templatesLoading}
                            className="px-6 py-2 bg-primary text-white hover:text-black hover:dark:text-white rounded border border-primary hover:bg-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                        >
                            {loading ? 'Sending...' : 'Submit'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TemplateMessage;