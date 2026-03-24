import { supabase } from './supabase';
import { Customer, Sale, PaymentStatus } from '../types';

export const getCustomers = async (): Promise<Customer[]> => {
    const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('name');

    if (error) throw error;
    return data.map(c => ({
        id: c.id,
        name: c.name,
        phone: c.phone || '',
        notes: c.notes || '',
        avatarUrl: c.avatar_url,
        initials: c.initials
    }));
};

export const getSales = async (): Promise<Sale[]> => {
    const { data, error } = await supabase
        .from('sales')
        .select(`
      *,
      customers (
        name
      )
    `)
        .order('date', { ascending: false });

    if (error) throw error;

    return data.map(s => ({
        id: s.id,
        customerId: s.customer_id,
        customerName: s.customers?.name || 'Cliente desconhecido',
        quantity: s.quantity,
        value: s.value,
        date: s.date,
        paymentDate: s.payment_date,
        status: s.status as PaymentStatus,
        description: s.description || ''
    }));
};

export const createCustomer = async (customer: Omit<Customer, 'id'>): Promise<Customer> => {
    const { data, error } = await supabase
        .from('customers')
        .insert([{
            name: customer.name,
            phone: customer.phone,
            notes: customer.notes,
            avatar_url: customer.avatarUrl,
            initials: customer.initials
        }])
        .select()
        .single();

    if (error) throw error;
    return {
        id: data.id,
        name: data.name,
        phone: data.phone || '',
        notes: data.notes || '',
        avatarUrl: data.avatar_url,
        initials: data.initials
    };
};

export const createSale = async (sale: Omit<Sale, 'id' | 'customerName'>): Promise<void> => {
    const { error } = await supabase
        .from('sales')
        .insert([{
            customer_id: sale.customerId,
            quantity: sale.quantity,
            value: sale.value,
            date: sale.date,
            status: sale.status,
            description: sale.description
        }]);

    if (error) throw error;
};

export const updateCustomer = async (id: string, customer: Partial<Customer>): Promise<void> => {
    const { error } = await supabase
        .from('customers')
        .update({
            name: customer.name,
            phone: customer.phone,
            notes: customer.notes,
            avatar_url: customer.avatarUrl,
            initials: customer.initials
        })
        .eq('id', id);

    if (error) throw error;
};

export const deleteCustomer = async (id: string): Promise<void> => {
    const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);

    if (error) throw error;
};

export const updateSale = async (id: string, sale: Partial<Sale>): Promise<void> => {
    const { error } = await supabase
        .from('sales')
        .update({
            customer_id: sale.customerId,
            quantity: sale.quantity,
            value: sale.value,
            date: sale.date,
            status: sale.status,
            description: sale.description
        })
        .eq('id', id);

    if (error) throw error;
};

export const deleteSale = async (id: string): Promise<void> => {
    const { error } = await supabase
        .from('sales')
        .delete()
        .eq('id', id);

    if (error) throw error;
};

export const updateSaleStatus = async (id: string, status: PaymentStatus, paymentDate?: string): Promise<void> => {
    const { error } = await supabase
        .from('sales')
        .update({
            status,
            payment_date: paymentDate
        })
        .eq('id', id);

    if (error) {
        // Fallback for missing payment_date column
        if (error.code === 'PGRST204') {
            const { error: fallbackError } = await supabase
                .from('sales')
                .update({ status })
                .eq('id', id);
            
            if (fallbackError) throw fallbackError;
        } else {
            throw error;
        }
    }
};

export const getPublicAppSettings = async (): Promise<any | null> => {
    try {
        const { data, error } = await supabase
            .from('app_settings')
            .select('app_name, app_logo')
            .limit(1)
            .single();

        if (error) {
            if (error.code === 'PGRST116' || error.code === 'PGRST205') return null;
            throw error;
        }
        if (!data) return null;

        return {
            appName: data.app_name,
            appLogo: data.app_logo
        };
    } catch (error) {
        console.warn('Error fetching public app settings:', error);
        return null;
    }
};

export const getAppSettings = async (): Promise<any | null> => {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return getPublicAppSettings();

        const { data, error } = await supabase
            .from('app_settings')
            .select('*')
            .eq('user_id', session.user.id)
            .single();

        if (error) {
            if (error.code === 'PGRST116' || error.code === 'PGRST205') return getPublicAppSettings();
            throw error;
        }
        if (!data) return getPublicAppSettings();

        return {
            appName: data.app_name,
            appLogo: data.app_logo
        };
    } catch (error) {
        console.warn('App settings error fetching:', error);
        return null;
    }
};

export const updateAppSettings = async (settings: { appName: string; appLogo: string }): Promise<void> => {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('No active session');

        const { error } = await supabase
            .from('app_settings')
            .upsert({
                user_id: session.user.id,
                app_name: settings.appName,
                app_logo: settings.appLogo
            }, { onConflict: 'user_id' });

        if (error) throw error;
    } catch (error) {
        console.error('Error updating app settings:', error);
        throw error;
    }
};
