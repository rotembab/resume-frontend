import { useFormik } from 'formik';
import * as Yup from 'yup';
import emailjs from '@emailjs/browser';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { useSnackbar } from '../../ui/snackbar/use-snackbar';
import { usePortfolio } from '../../portfolio/use-portfolio';

export const ContactForm = () => {
  const { copy } = usePortfolio();
  const { showSnackbar } = useSnackbar();
  const [submitting, setSubmitting] = useState(false);
  const previousCopy = useRef(copy);
  const validationSchema = Yup.object({
    name: Yup.string().trim().required(copy.contactNameRequired),
    email: Yup.string()
      .trim()
      .email(copy.contactInvalidEmail)
      .required(copy.contactEmailRequired),
    message: Yup.string().trim().required(copy.contactMessageRequired),
  });
  const formik = useFormik({
    initialValues: { name: '', email: '', message: '' },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      setSubmitting(true);
      try {
        await emailjs.send(
          import.meta.env.VITE_EMAILJS_SERVICE_ID!,
          import.meta.env.VITE_SEND_TO_ME_TEMPLATE_ID!,
          {
            email: values.email.trim(),
            name: values.name.trim(),
            message: values.message.trim(),
            time: new Date().toLocaleString(),
          },
          import.meta.env.VITE_EMAILJS_PUBLIC_KEY!
        );
        // A confirmation-email failure does not undo a delivered message.
        if (import.meta.env.VITE_REPLY_TEMPLATE_ID) {
          try {
            await emailjs.send(
              import.meta.env.VITE_EMAILJS_SERVICE_ID!,
              import.meta.env.VITE_REPLY_TEMPLATE_ID!,
              { email: values.email.trim(), name: values.name.trim() },
              import.meta.env.VITE_EMAILJS_PUBLIC_KEY!
            );
          } catch {
            /* Owner delivery succeeded; avoid asking the visitor to resend. */
          }
        }
        resetForm();
        showSnackbar(copy.contactSuccess, 'success');
      } catch {
        showSnackbar(copy.contactError, 'error');
      } finally {
        setSubmitting(false);
      }
    },
  });
  const { validateForm } = formik;
  useEffect(() => {
    if (previousCopy.current !== copy) {
      previousCopy.current = copy;
      void validateForm();
    }
  }, [copy, validateForm]);
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting || formik.isSubmitting) return;
    const errors = await formik.validateForm();
    const invalidField = (['name', 'email', 'message'] as const).find(
      (field) => errors[field]
    );
    if (invalidField) {
      await formik.setTouched(
        { name: true, email: true, message: true },
        false
      );
      requestAnimationFrame(() => {
        document.getElementById('contact-' + invalidField)?.focus();
      });
      return;
    }
    await formik.submitForm();
  };
  return (
    <form className='contact-form' onSubmit={handleSubmit} noValidate>
      <div className='contact-field-row'>
        <div className='form-field'>
          <label htmlFor='contact-name'>{copy.contactName}</label>
          <input
            id='contact-name'
            name='name'
            autoComplete='name'
            required
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            aria-invalid={!!(formik.touched.name && formik.errors.name)}
            aria-describedby={
              formik.touched.name && formik.errors.name
                ? 'name-error'
                : undefined
            }
          />
          {formik.touched.name && formik.errors.name && (
            <p className='field-error' id='name-error'>
              {formik.errors.name}
            </p>
          )}
        </div>
        <div className='form-field'>
          <label htmlFor='contact-email'>{copy.contactEmail}</label>
          <input
            id='contact-email'
            name='email'
            type='email'
            dir='ltr'
            autoComplete='email'
            required
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            aria-invalid={!!(formik.touched.email && formik.errors.email)}
            aria-describedby={
              formik.touched.email && formik.errors.email
                ? 'email-error'
                : undefined
            }
          />
          {formik.touched.email && formik.errors.email && (
            <p className='field-error' id='email-error'>
              {formik.errors.email}
            </p>
          )}
        </div>
      </div>
      <div className='form-field'>
        <label htmlFor='contact-message'>{copy.contactMessage}</label>
        <textarea
          id='contact-message'
          name='message'
          rows={4}
          required
          value={formik.values.message}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          aria-invalid={!!(formik.touched.message && formik.errors.message)}
          aria-describedby={
            formik.touched.message && formik.errors.message
              ? 'message-error'
              : undefined
          }
        />
        {formik.touched.message && formik.errors.message && (
          <p className='field-error' id='message-error'>
            {formik.errors.message}
          </p>
        )}
      </div>
      <button
        type='submit'
        className='button button-primary'
        disabled={submitting}
      >
        {submitting ? copy.contactSending : copy.contactSend}
        <span aria-hidden='true'>↗</span>
      </button>
    </form>
  );
};
