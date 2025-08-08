import React, { useState } from 'react';
import Axios from '../utils/axios';
import SummaryApi from '../common/Summaryapi';
import { toast } from 'react-toastify';
import PageHeader from '../components/utils/PageHeader';

const BulkMessage = () => {
    const [data, setData] = useState({
        phone: '',
        message: '',
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent page reload
        if(data.message =="" && data.phone ==""){
            toast.error(`Please enter number and message`, { autoClose: 2000 });
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
                formData.append("message", data.message);
                const response = await Axios({
                    ...SummaryApi.send_message,
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
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <PageHeader title="Bulk Message"/>
      <div className="p-2 bg-white dark:bg-darkinfo text-gray-900 dark:text-white h-[calc(100vh-190px)] rounded-lg overflow-hidden">
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-12 gap-6 mb-4">
                        {/* Phone Number Textarea */}
                        <div className="col-span-12 md:col-span-6 flex flex-col gap-2">
                            <label htmlFor="phone">Phone Numbers</label>
                            <textarea
                                name="phone"
                                placeholder="Enter one number per line"
                                id="phone"
                                className="bg-transparent p-3 border border-primary focus:outline-none w-full min-h-[150px] rounded"
                                value={data.phone}
                                onChange={handleChange}
                            ></textarea>
                        </div>

                        {/* Message Textarea */}
                        <div className="col-span-12 md:col-span-6 flex flex-col gap-2">
                            <label htmlFor="message">Message</label>
                            <textarea
                                name="message"
                                placeholder="Enter your message"
                                id="message"
                                className="bg-transparent p-3 border border-primary focus:outline-none w-full min-h-[150px] rounded"
                                value={data.message}
                                onChange={handleChange}
                            ></textarea>
                        </div>
                    </div>

                   <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
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

export default BulkMessage;
