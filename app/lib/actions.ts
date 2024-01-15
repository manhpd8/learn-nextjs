'use server';
import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// dung de validate du lieu
const FormSchema = z.object({
    id: z.string(),
    customerId: z.string(),
    amount: z.coerce.number(),
    status: z.enum(['pending', 'paid']),
    date: z.string(),
  });
const CreateInvoice = FormSchema.omit({ id: true, date: true });
export async function createInvoice(formData: FormData) {
    const { customerId, amount, status } = CreateInvoice.parse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
      });
    const amountInCents = amount * 100;
    const date = new Date().toISOString().split('T')[0];

    // insert vao db
    try {
        await sql`
        INSERT INTO invoices (customer_id, amount, status, date)
        VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
      `;
    } catch (error) {
        return {
            message: 'Database Error: Failed to Create Invoice.',
          };
    }
    

  // chuyen huong sau khi insert
  revalidatePath('/dashboard/invoices'); // to clear the client cache and make a new server request.
  redirect('/dashboard/invoices');
}

// Use Zod to update the expected types
const UpdateInvoice = FormSchema.omit({ id: true, date: true });
 
// ...
 
export async function updateInvoice(id: string, formData: FormData) {
  const { customerId, amount, status } = UpdateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
 
  const amountInCents = amount * 100;
 console.log('dang update thong tin invoice')
  
  try {
    await sql`
    UPDATE invoices
    SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
    WHERE id = ${id}
  `;
  }
  catch (error) {
    return { message: 'Database Error: Failed to Update Invoice.' };
  }
  console.log('da update invoice')
  revalidatePath('/dashboard/invoices');// load data moi
  redirect('/dashboard/invoices');//chuyen den page
}

export async function deleteInvoice(id: string) {
    try {
        await sql`DELETE FROM invoices WHERE id = ${id}`;
    }
    catch (error) {
        return { message: 'Database Error: Failed to Update Invoice.' };
      }
    revalidatePath('/dashboard/invoices');
  }