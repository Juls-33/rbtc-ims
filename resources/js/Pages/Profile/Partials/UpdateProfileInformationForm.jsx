// resources/js/Pages/Profile/Partials/UpdateProfileInformationForm.jsx

import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { useForm, usePage } from '@inertiajs/react';
import { Transition } from '@headlessui/react';

export default function UpdateProfileInformation({ mustVerifyEmail, status, className = '', onSuccess }) {
    const user = usePage().props.auth.user;

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email,
        address: user.address || '',
        phone: user.contact_no || '',
    });

    const submit = (e) => {
        e.preventDefault();
        patch(route('profile.update'), {
            preserveScroll: true,
            onSuccess: () => {
                if (onSuccess) onSuccess();
            }
        });
    };

    const labelStyle = "text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1";

    return (
        <section className={className}>
            <form onSubmit={submit} className="space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <InputLabel htmlFor="first_name" value="First Name" className={labelStyle} />
                        <TextInput
                            id="first_name"
                            className="mt-1 block w-full bg-slate-50 border-slate-200 focus:bg-white"
                            value={data.first_name}
                            onChange={(e) => setData('first_name', e.target.value)}
                            required
                        />
                        <InputError className="mt-2" message={errors.first_name} />
                    </div>

                    <div>
                        <InputLabel htmlFor="last_name" value="Last Name" className={labelStyle} />
                        <TextInput
                            id="last_name"
                            className="mt-1 block w-full bg-slate-50 border-slate-200 focus:bg-white"
                            value={data.last_name}
                            onChange={(e) => setData('last_name', e.target.value)}
                            required
                        />
                        <InputError className="mt-2" message={errors.last_name} />
                    </div>
                </div>

                <div>
                    <InputLabel htmlFor="email" value="Email Address" className={labelStyle} />
                    <TextInput
                        id="email"
                        type="email"
                        className="mt-1 block w-full bg-slate-50 border-slate-200 focus:bg-white"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        autoComplete="username"
                    />
                    <InputError className="mt-2" message={errors.email} />
                </div>

                <div>
                    <InputLabel htmlFor="phone" value="Contact Number" className={labelStyle} />
                    <TextInput
                        id="phone"
                        type="text"
                        className="mt-1 block w-full bg-slate-50 border-slate-200 focus:bg-white"
                        value={data.phone}
                        onChange={(e) => setData('phone', e.target.value)}
                        placeholder="e.g. 0917-123-4567"
                    />
                    <InputError className="mt-2" message={errors.phone} />
                </div>

                <div>
                    <InputLabel htmlFor="address" value="Residential Address" className={labelStyle} />
                    <textarea
                        id="address"
                        className="mt-1 block w-full border-slate-200 bg-slate-50 focus:bg-white focus:border-[#30499B] focus:ring-[#30499B] rounded-md shadow-sm text-sm"
                        value={data.address}
                        onChange={(e) => setData('address', e.target.value)}
                        rows="3"
                    />
                    <InputError className="mt-2" message={errors.address} />
                </div>

                <div className="flex items-center gap-4 pt-4">
                    <PrimaryButton 
                        type="submit"
                        disabled={processing}
                        className="bg-[#2E7D32] hover:bg-green-700 font-black uppercase text-[10px] tracking-widest px-8 py-3"
                    >
                        Save Personal Records
                    </PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-emerald-600 font-bold uppercase tracking-tighter italic">Successfully Updated.</p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}