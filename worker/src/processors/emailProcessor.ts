import { Job } from 'bullmq';
import { Resend } from 'resend';
import { EmailJobData } from '../queues/emailQueue.js';

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY || 'random_key');

export async function processEmailJob(job: Job<EmailJobData>) {
    const { data } = job;

    try {
        console.log(`📧 Processing email job for ${data.to}, type: ${data.type}`);

        switch (data.type) {
            case 'subscription_confirmation':
                await sendSubscriptionConfirmationEmail(data);
                break;
            case 'welcome':
                await sendWelcomeEmail(data);
                break;
            case 'credit_topup':
                await sendCreditTopUpEmail(data);
                break;
            default:
                throw new Error(`Unknown email type: ${(data as any).type}`);
        }

        console.log(`✅ Email sent successfully to ${data.to}`);
        return { success: true, emailType: data.type };

    } catch (error) {
        console.error(`❌ Failed to send email to ${data.to}:`, error);
        throw error; // This will trigger retry logic
    }
}

async function sendSubscriptionConfirmationEmail(data: any) {
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Subscription Confirmed - Branvia</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
                <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Subscription Confirmed!</h1>
            </div>
            
            <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 20px;">
                <h2 style="color: #2c3e50; margin-top: 0;">Welcome to Branvia, ${data.userName}!</h2>
                <p>Your subscription has been successfully activated. Here are your subscription details:</p>
                
                <div style="background: white; padding: 20px; border-radius: 6px; border-left: 4px solid #667eea; margin: 20px 0;">
                    <p><strong>Subscription ID:</strong> <code style="background: #f1f3f4; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${data.subscriptionId}</code></p>
                    <p><strong>Plan:</strong> ${data.plan}</p>
                    <p><strong>Amount:</strong> $${data.amount}</p>
                    ${data.nextBillingDate ? `<p><strong>Next Billing:</strong> ${data.nextBillingDate}</p>` : ''}
                </div>
            </div>
            
            <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; border-left: 4px solid #28a745;">
                <h3 style="color: #155724; margin-top: 0;">🚀 What's Next?</h3>
                <p>You can now start creating AI-powered product campaigns and generate professional images for your brand!</p>
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://branvia.art'}/campaign/generate" style="display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Create Your First Campaign</a>
            </div>
            
            <div style="text-align: center; margin-top: 30px; color: #6c757d; font-size: 14px;">
                <p>Thank you for choosing Branvia!</p>
                <p>If you have any questions, please contact our support team.</p>
            </div>
        </body>
        </html>
    `;

    await resend.emails.send({
        from: 'Branvia <noreply@branvia.art>',
        to: data.to,
        subject: `Subscription Confirmed - Welcome to Branvia!`,
        html: html,
    });
}

async function sendWelcomeEmail(data: any) {
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to Branvia</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
                <h1 style="color: white; margin: 0; font-size: 28px;">🎨 Welcome to Branvia!</h1>
            </div>
            
            <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 20px;">
                <h2 style="color: #2c3e50; margin-top: 0;">Hello ${data.userName}!</h2>
                <p>Welcome to Branvia - your AI-powered platform for creating stunning product images and campaigns!</p>
                
                <div style="background: white; padding: 20px; border-radius: 6px; margin: 20px 0;">
                    <h3 style="color: #667eea; margin-top: 0;">✨ What You Can Do:</h3>
                    <ul style="color: #555;">
                        <li>Create professional product campaigns</li>
                        <li>Generate AI-powered images</li>
                        <li>Choose from multiple styles and formats</li>
                        <li>Manage your credits and subscriptions</li>
                    </ul>
                </div>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://branvia.art'}/campaign/generate" style="display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Get Started Now</a>
            </div>
            
            <div style="text-align: center; margin-top: 30px; color: #6c757d; font-size: 14px;">
                <p>Welcome aboard!</p>
            </div>
        </body>
        </html>
    `;

    await resend.emails.send({
        from: 'Branvia <noreply@branvia.art>',
        to: data.to,
        subject: 'Welcome to Branvia - Start Creating Amazing Images!',
        html: html,
    });
}

async function sendCreditTopUpEmail(data: any) {
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Credits Added - Branvia</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
                <h1 style="color: white; margin: 0; font-size: 28px;">💰 Credits Added!</h1>
            </div>
            
            <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 20px;">
                <h2 style="color: #2c3e50; margin-top: 0;">Hello ${data.userName}!</h2>
                <p>Great news! Your account has been credited with additional image generation credits.</p>
                
                <div style="background: white; padding: 20px; border-radius: 6px; border-left: 4px solid #28a745; margin: 20px 0;">
                    <p><strong>Credits Added:</strong> <span style="color: #28a745; font-weight: bold; font-size: 18px;">${data.credits}</span></p>
                    <p><strong>Reason:</strong> ${data.reason}</p>
                </div>
            </div>
            
            <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; border-left: 4px solid #28a745;">
                <h3 style="color: #155724; margin-top: 0;">🎨 Ready to Create More Images?</h3>
                <p>You now have more credits to continue creating amazing product campaigns!</p>
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://branvia.art'}/campaign/generate" style="display: inline-block; background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Create New Campaign</a>
            </div>
            
            <div style="text-align: center; margin-top: 30px; color: #6c757d; font-size: 14px;">
                <p>Happy creating!</p>
            </div>
        </body>
        </html>
    `;

    await resend.emails.send({
        from: 'Branvia <noreply@branvia.art>',
        to: data.to,
        subject: `Credits Added - ${data.credits} New Credits Available!`,
        html: html,
    });
}
