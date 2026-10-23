// InquiryModal.js
import { useState } from 'react';
import styles from './bookNow.module.css';

const InquiryModal = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
        name: '',
        company: '',
        email: '',
        phone: '',
        passengers: '',
        luggage: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Add your form submission logic here

            // Clear form and close modal on success
            setFormData({
                name: '',
                company: '',
                email: '',
                phone: '',
                passengers: '',
                luggage: ''
            });
            onClose();
        } catch (error) {
            console.error('Error submitting form:', error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h2>Make an Inquiry</h2>
                    <button
                        onClick={onClose}
                        className={styles.closeButton}
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label htmlFor="name">Name*</label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="Enter your name"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="company">Company</label>
                        <input
                            id="company"
                            name="company"
                            type="text"
                            value={formData.company}
                            onChange={handleChange}
                            placeholder="Enter your company name"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="email">Email*</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="Enter your email"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="phone">Phone Number*</label>
                        <input
                            id="phone"
                            name="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                            placeholder="Enter your phone number"
                        />
                    </div>

                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label htmlFor="passengers">Number of Passengers*</label>
                            <input
                                id="passengers"
                                name="passengers"
                                type="number"
                                min="1"
                                value={formData.passengers}
                                onChange={handleChange}
                                required
                                placeholder="0"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="luggage">Number of Luggage*</label>
                            <input
                                id="luggage"
                                name="luggage"
                                type="number"
                                min="0"
                                value={formData.luggage}
                                onChange={handleChange}
                                required
                                placeholder="0"
                            />
                        </div>
                    </div>

                    <div className={styles.buttonGroup}>
                        <button
                            type="button"
                            onClick={onClose}
                            className={styles.cancelButton}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={styles.submitButton}
                        >
                            Submit Inquiry
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InquiryModal;