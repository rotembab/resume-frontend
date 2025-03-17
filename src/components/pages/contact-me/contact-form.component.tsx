import { Box, Button, TextField } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import emailjs from '@emailjs/browser';
import { useState } from 'react';

export const ContactForm = () => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validationSchema = Yup.object({
    name: Yup.string().required(t('Contact.Form.nameRequired')),
    email: Yup.string()
      .email(t('Contact.Form.invalidEmail'))
      .required(t('Contact.Form.emailRequired')),
    message: Yup.string().required(t('Contact.Form.messageRequired')),
  });

  const handleSubmit = async (values: any, { resetForm }: any) => {
    setIsSubmitting(true);
    let autoReplySuccess = false;
    let messageToMeSuccess = false;

    try {
      // Send auto-reply to the sender with their email and name
      try {
        await emailjs.send(
          import.meta.env.VITE_EMAILJS_SERVICE_ID!,
          import.meta.env.VITE_REPLY_TEMPLATE_ID!,
          {
            email: values.email,
            name: values.name,
          },
          import.meta.env.VITE_EMAILJS_PUBLIC_KEY!
        );
        autoReplySuccess = true;
      } catch (error) {
        console.error('Auto-reply email failed:', error);
      }

      // Send message to you with email, name, message and current time
      try {
        await emailjs.send(
          import.meta.env.VITE_EMAILJS_SERVICE_ID!,
          import.meta.env.VITE_SEND_TO_ME_TEMPLATE_ID!,
          {
            email: values.email,
            name: values.name,
            message: values.message,
            time: new Date().toLocaleString(), // Adds current date and time
          },
          import.meta.env.VITE_EMAILJS_PUBLIC_KEY!
        );
        messageToMeSuccess = true;
      } catch (error) {
        console.error('Message to owner email failed:', error);
      }

      if (autoReplySuccess && messageToMeSuccess) {
        resetForm();
        alert(t('Contact.Form.successMessage'));
      } else {
        alert(t('Contact.Form.errorMessage'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      message: '',
    },
    validationSchema,
    onSubmit: handleSubmit,
  });

  return (
    <Box component='form' onSubmit={formik.handleSubmit}>
      <Grid spacing={4} container>
        <Grid size={6}>
          <TextField
            fullWidth
            name='name'
            type='text'
            size='small'
            required
            label={t('Contact.Form.name')}
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name && formik.errors.name}
          />
        </Grid>
        <Grid size={6}>
          <TextField
            fullWidth
            name='email'
            size='small'
            type='email'
            required
            label={t('Contact.Form.email')}
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
          />
        </Grid>
        <Grid size={12}>
          <TextField
            fullWidth
            name='message'
            required
            label={t('Contact.Form.message')}
            rows={4}
            multiline
            value={formik.values.message}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.message && Boolean(formik.errors.message)}
            helperText={formik.touched.message && formik.errors.message}
          />
        </Grid>
        <Grid size={12}>
          <Button
            type='submit'
            sx={{
              width: '100%',
            }}
            variant='contained'
            color='primary'
            disabled={isSubmitting}
          >
            {isSubmitting
              ? t('Contact.Form.sending')
              : t('Contact.Form.submit')}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};
