import { useState } from 'react'
import { Input } from '../ui/input1'
import { Button } from '../ui/button'
import { ChevronRight, EuroIcon } from 'lucide-react';
import { useRouter } from 'next/router';

interface Props{
    defaultCheckin?: string;
    defaultCheckout?: string;
}

const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
};

export const CheckinForm = ({defaultCheckin, defaultCheckout}: Props) => {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 8);
    
    const defaultCheckinDate = formatDate(today);
    const defaultCheckoutDate = formatDate(nextWeek);
    
    const [checkin, setCheckin] = useState(defaultCheckin || defaultCheckinDate);
    const [checkout, setCheckout] = useState(defaultCheckout || defaultCheckoutDate);
    const router = useRouter();
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        void router.push('/villas');
    }

    return (
        <div className='bg-white p-4'>
            <h1 className='text-2xl font-semibold text-center text-soft-gray-dark mb-5'>PLAN YOUR TRIP</h1>
            <form className='flex flex-col just gap-4' onSubmit={handleSubmit}>
                <div className='flex gap-4 justify-center'>
                    <Input type="date" id="checkin" name="checkin" className='border rounded-none p-2' value={checkin||defaultCheckin} onChange={(e) => setCheckin(e.target.value)} />
                    <Input type="date" id="checkout" name="checkout" className='border rounded-none p-2' value={checkout||defaultCheckout} onChange={(e) => setCheckout(e.target.value)} />
                </div>
                <div className='flex flex-col justify-center items-center'>
                    <div className='flex flex-col'>
                        <span className='flex items-center text-primary font-semibold text-2xl'>{<EuroIcon className='h-5 w-5' />} {(12000).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                        <span className='ml-5 text-sm text-gray-500'>{(3000).toLocaleString('en-US')} /Night</span>
                    </div>

                </div>
                <Button type="submit" className='bg-[#28F7EA] text-[#172338]  p-2 h-12'>Make a Request <ChevronRight className='h-4 w-4' /></Button>
            </form>
        </div>
    )
}
