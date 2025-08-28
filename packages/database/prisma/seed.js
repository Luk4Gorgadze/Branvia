import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();

async function main() {
    // Ensure a demo user exists 
    const demoEmail = 'demo@branvia.art';
    const demoUser = await prisma.user.upsert({
        where: { email: demoEmail },
        update: {},
        create: {
            id: 'demo-user-id',
            name: 'Demo User',
            email: demoEmail,
            emailVerified: true,
            image: null,
            availableCredits: 0,
        },
    });

    const sampleCampaigns = [
        {
            productTitle: 'Ceramic vase',
            productDescription: 'Ceramic vase',
            selectedStyle: 'rustic-natural',
            customStyle: null,
            outputFormat: 'square',
            productImageS3Key: 'permanent-uploads/FObfsqFrSwcsUrNG3dPhghBumWN3v90f/cmelmro2y00132e8rnkxqpiev/product-image-2025-08-21T16-44-41-884Z.jpg',
            generatedImages: [
                'generated-images/generated-cmelmro2y00132e8rnkxqpiev-1-2025-08-21T16-44-40-707Z.jpg',
                'generated-images/generated-cmelmro2y00132e8rnkxqpiev-2-2025-08-21T16-44-40-707Z.jpg',
                'generated-images/generated-cmelmro2y00132e8rnkxqpiev-3-2025-08-21T16-44-40-707Z.jpg'
            ],
            prompt: "An ultra-realistic, high-end commercial product photograph of a ceramic vase. The vase must remain absolutely identical to the provided reference in shape, proportions, textures, colors, and branding. It is positioned on a natural, subtly textured, light-colored wooden surface, slightly off-center. The background features softly blurred, organic elements like dried pampas grass or delicate wild branches, with hints of a warm, sun-drenched plaster wall, evoking a serene rustic-natural aesthetic. Lighting is soft, diffused natural light from a large window, emphasizing the vase's texture and form. Shot on a Sony a7R V with a G Master 85mm f/1.4 lens, using an f/4 aperture for professional depth of field. Square format.",
            createdAt: new Date('2025-01-01T10:00:00Z'),
        },
        {
            productTitle: 'Handmade bag',
            productDescription: 'Handmade bag',
            selectedStyle: 'elegant-luxurious',
            customStyle: null,
            outputFormat: 'square',
            productImageS3Key: 'permanent-uploads/FObfsqFrSwcsUrNG3dPhghBumWN3v90f/cmel5wcfg000je2es5xdi2pww/product-image-2025-08-21T08-51-44-943Z.jpg',
            generatedImages: [
                'generated-images/generated-cmel5wcfg000je2es5xdi2pww-1-2025-08-21T08-51-43-788Z.jpg',
                'generated-images/generated-cmel5wcfg000je2es5xdi2pww-2-2025-08-21T08-51-43-789Z.jpg',
                'generated-images/generated-cmel5wcfg000je2es5xdi2pww-3-2025-08-21T08-51-43-789Z.jpg'
            ],
            prompt: "An ultra-realistic, luxurious editorial studio shot of a handmade bag. The bag's exact shape, proportions, textures, colors, and branding must be perfectly preserved as if from a reference, with no changes or substitutions. Captured with a DSLR and an 85mm f/1.4 lens, a shallow depth of field isolates the product. Professional studio lighting utilizes soft, diffused light from a 45° octabox as key, with subtle fill illumination. The background is a clean, elegant gradient that complements the bag's premium aesthetic. This refined image is ideal for luxury marketing, presenting the product centrally in a square format.",
            createdAt: new Date('2025-01-02T10:00:00Z'),
        },
        {
            productTitle: 'Coffee in a glass',
            productDescription: 'Coffee in a glass',
            selectedStyle: 'warm-cozy',
            customStyle: null,
            outputFormat: 'portrait',
            productImageS3Key: 'permanent-uploads/FObfsqFrSwcsUrNG3dPhghBumWN3v90f/cmelgh6g600032e8rjjo0bxiy/product-image-2025-08-21T13-48-16-460Z.jpg',
            generatedImages: [
                'generated-images/generated-cmelgh6g600032e8rjjo0bxiy-1-2025-08-21T13-48-14-704Z.jpg',
                'generated-images/generated-cmelgh6g600032e8rjjo0bxiy-2-2025-08-21T13-48-14-708Z.jpg',
                'generated-images/generated-cmelgh6g600032e8rjjo0bxiy-3-2025-08-21T13-48-14-709Z.jpg'
            ],
            prompt: "The coffee in a clear glass, with its exact shape, proportions, textures, and rich color, is the untouched central focus of this ultra-realistic, refined, luxury editorial product photograph. A warm, cozy aesthetic is achieved through professional studio lighting: soft, diffused key light from a large 45° octabox, complemented by subtle fill light, highlighting the coffee's clarity and texture. Shot with a DSLR and an 85mm f/1.4 lens, an extremely shallow depth of field renders the background a creamy bokeh. The clean, gradient backdrop, in complementary warm tones (e.g., soft beige or muted terracotta), subtly textured, enhances the premium feel. Portrait orientation.",
            createdAt: new Date('2025-01-03T10:00:00Z'),
        },
        {
            productTitle: 'Woman\'s necklace',
            productDescription: 'Woman\'s necklace',
            selectedStyle: 'rustic-natural',
            customStyle: null,
            outputFormat: 'landscape',
            productImageS3Key: 'permanent-uploads/FObfsqFrSwcsUrNG3dPhghBumWN3v90f/cmelkxugn000j2e8rh4kw06ys/product-image-2025-08-21T15-54-14-725Z.jpg',
            generatedImages: [
                'generated-images/generated-cmelkxugn000j2e8rh4kw06ys-1-2025-08-21T15-54-13-132Z.jpg',
                'generated-images/generated-cmelkxugn000j2e8rh4kw06ys-2-2025-08-21T15-54-13-135Z.jpg',
                'generated-images/generated-cmelkxugn000j2e8rh4kw06ys-3-2025-08-21T15-54-13-136Z.jpg'

            ],
            prompt: "Ultra-realistic, high-resolution commercial product photograph of an elegant necklace. The necklace's shape, proportions, textures, colors, and branding are **absolutely identical and unchanged**. It rests elegantly on a weathered, light-toned natural wood surface, subtly accented by blurred, soft-focus elements like dried floral sprigs or smooth river pebbles in the shallow depth of field. Soft, diffused natural light from a large window illuminates the scene, highlighting the necklace's exquisite details and natural sparkle. Captured with a Sony a7R V and a 100mm f/2.8 macro lens, ensuring a refined, high-end marketing aesthetic. Landscape orientation.",
            createdAt: new Date('2025-01-04T10:00:00Z'),
        },
        {
            productTitle: 'Sports shoes',
            productDescription: 'Sports shoe',
            selectedStyle: 'bright-playful',
            customStyle: null,
            outputFormat: 'landscape',
            productImageS3Key: 'permanent-uploads/FObfsqFrSwcsUrNG3dPhghBumWN3v90f/cmelle1ku000n2e8rxupsnseh/product-image-2025-08-21T16-06-28-596Z.jpg',
            generatedImages: [
                'generated-images/generated-cmelle1ku000n2e8rxupsnseh-2-2025-08-21T16-06-26-440Z.jpg',
                'generated-images/generated-cmelle1ku000n2e8rxupsnseh-1-2025-08-21T16-06-26-439Z.jpg',
                'generated-images/generated-cmelle1ku000n2e8rxupsnseh-3-2025-08-21T16-06-26-440Z.jpg'
            ],
            prompt: "An ultra-realistic, high-end marketing shot of a pair of identical sports shoes. The product must remain identical in shape, proportions, textures, colors, and branding. Captured with a **Canon EOS R5** and **Canon RF 100mm f/2.8 L Macro IS USM lens**. Bright, playful aesthetic. The shoes are presented on a clean, stylized pastel-colored platform, surrounded by soft, abstract geometric shapes and diffused light gradients in the background. Natural, bright, and even studio lighting with professional depth of field precisely highlighting the product. Refined, clean presentation. Landscape format.",
            createdAt: new Date('2025-01-05T10:00:00Z'),
        },
        {
            productTitle: 'Bracelet',
            productDescription: 'Bracelet for women',
            selectedStyle: 'elegant-luxurious',
            customStyle: null,
            outputFormat: 'square',
            productImageS3Key: 'permanent-uploads/FObfsqFrSwcsUrNG3dPhghBumWN3v90f/cmelmg76p000z2e8rcxxkjbsq/product-image-2025-08-21T16-35-41-036Z.jpg',
            generatedImages: [
                'generated-images/generated-cmelmg76p000z2e8rcxxkjbsq-1-2025-08-21T16-35-39-737Z.jpg',
                'generated-images/generated-cmelmg76p000z2e8rcxxkjbsq-2-2025-08-21T16-35-39-737Z.jpg',
                'generated-images/generated-cmelmg76p000z2e8rcxxkjbsq-3-2025-08-21T16-35-39-738Z.jpg'
            ],
            prompt: "Ultra-realistic, high-resolution studio shot of a specific women's bracelet, absolutely identical to the reference image in all details (shape, proportions, textures, colors, branding). The bracelet is elegantly presented on a softly blurred, creamy white marble surface, bathed in warm, natural diffused light that highlights its intricate details and metallic gleam. Subtle, soft shadows enhance dimensionality without obscuring. The background suggests a sophisticated, minimalist luxury aesthetic, using clean lines and a hint of a plush, neutral-toned fabric in the distant, out-of-focus background. Shot with a Sony A7R IV and a Sigma 105mm f/2.8 DG DN Macro Art lens, employing a shallow depth of field for professional bokeh, with pin-sharp focus on the product. Perfect for high-end marketing. Aspect Ratio: 1:1.",
            createdAt: new Date('2025-01-06T10:00:00Z'),
        },
        {
            productTitle: 'Chocolate',
            productDescription: 'Homemade chocolate pieces',
            selectedStyle: 'rustic-natural',
            customStyle: null,
            outputFormat: 'square',
            productImageS3Key: 'permanent-uploads/FObfsqFrSwcsUrNG3dPhghBumWN3v90f/cmelnbxd2001f2e8rirvj5jpb/product-image-2025-08-21T17-00-26-707Z.jpg',
            generatedImages: [
                'generated-images/generated-cmelnbxd2001f2e8rirvj5jpb-1-2025-08-21T17-00-25-471Z.jpg',
                'generated-images/generated-cmelnbxd2001f2e8rirvj5jpb-2-2025-08-21T17-00-25-472Z.jpg',
                'generated-images/generated-cmelnbxd2001f2e8rirvj5jpb-3-2025-08-21T17-00-25-472Z.jpg'
            ],
            prompt: "Ultra-realistic, high-resolution commercial product photography of homemade chocolate pieces. **Product identical to the reference image in every detail:** specific shapes, proportions, unique textures (e.g., cocoa powder dusting, inclusions), exact colors, and any inherent visual identity.\n\nArrangement is artful, on a rustic, weathered dark wooden surface with a soft, naturally textured linen fabric partially underneath. Subtle natural elements, like a few scattered whole cocoa beans or a hint of crumpled parchment, are elegantly blurred in the background.\n\nSoft, natural diffused light from the side highlights textures and creates inviting, gentle shadows. Shot with a full-frame mirrorless camera (e.g., Sony A7R IV) and a 100mm f/2.8 macro lens (e.g., Sony FE 90mm F2.8 Macro G OSS). Professional shallow depth of field, crisp focus on the chocolate, with a creamy, blurred bokeh. Square format. High-end marketing quality.",
            createdAt: new Date('2025-01-07T10:00:00Z'),
        },
        {
            productTitle: 'Sheep toy',
            productDescription: "Children's fluffy sheep toy",
            selectedStyle: 'bright-playful',
            customStyle: null,
            outputFormat: 'landscape',
            productImageS3Key: 'permanent-uploads/FObfsqFrSwcsUrNG3dPhghBumWN3v90f/cmelltq2w000r2e8r8nudisaa/product-image-2025-08-21T16-18-59-587Z.jpg',
            generatedImages: [
                'generated-images/generated-cmelltq2w000r2e8r8nudisaa-1-2025-08-21T16-18-58-081Z.jpg',
                'generated-images/generated-cmelltq2w000r2e8r8nudisaa-2-2025-08-21T16-18-58-082Z.jpg',
                'generated-images/generated-cmelltq2w000r2e8r8nudisaa-3-2025-08-21T16-18-58-082Z.jpg'

            ],
            prompt: "Ultra-realistic product photograph of a children's fluffy toy sheep, *exactly identical* in its provided shape, proportions, creamy white texture, black face/feet, and branding. The toy is centered, perfectly lit by soft, natural daylight cascading from a sun-drenched window on the right.\n\nThe bright-playful environment is a clean, modern nursery. A few pastel-colored wooden blocks (mint, peach, sky blue) are subtly blurred in the immediate foreground, adding depth. The background features a soft, out-of-focus wallpaper with a minimal, whimsical pattern (e.g., tiny clouds), enhancing the scene without distracting. Professional depth of field, with sharp focus on the sheep and creamy bokeh. Shot on a Canon EOS R5 with a Canon RF 85mm f/1.2 L USM lens at f/2.0. Landscape format. High-end marketing quality.",
            createdAt: new Date('2025-01-08T10:00:00Z'),
        }
    ];

    for (const sc of sampleCampaigns) {
        const existing = await prisma.campaign.findFirst({
            where: { userId: demoUser.id, productTitle: sc.productTitle },
            select: { id: true, public: true },
        });

        if (existing) {
            if (!existing.public) {
                await prisma.campaign.update({
                    where: { id: existing.id },
                    data: { public: true },
                });
            }
            continue;
        }

        await prisma.campaign.create({
            data: {
                userId: demoUser.id,
                productTitle: sc.productTitle,
                productDescription: sc.productDescription,
                selectedStyle: sc.selectedStyle,
                customStyle: sc.customStyle,
                outputFormat: sc.outputFormat,
                productImageS3Key: sc.productImageS3Key,
                generatedImages: sc.generatedImages,
                prompt: sc.prompt,
                status: 'completed',
                public: true,
                createdAt: sc.createdAt,
            },
        });
    }

    console.log('✅ Seeded example campaigns.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
