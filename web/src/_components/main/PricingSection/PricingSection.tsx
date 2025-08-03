'use client'
import styles from "./PricingSection.module.css";
import PriceCard from "./PriceCard";

const PricingSection = () => {
    const handleGetStarted = () => {
        // Handle get started action
        console.log("Get Started clicked");
    };

    const handleContactSales = () => {
        // Handle contact sales action
        console.log("Contact Sales clicked");
    };

    return (
        <section className={styles.pricingSection} id="pricing">
            <div className={styles.pricingHeadline}>Pricing</div>
            <div className={styles.pricingContent}>
                <div className={styles.pricingCards}>
                    <PriceCard
                        title="Starter"
                        price={29}
                        features={[
                            "500 credits",
                            "Standard resolution",
                            "Limited commercial use (must credit us)"
                        ]}
                        buttonText="Get Started"
                        onButtonClick={handleGetStarted}
                    />

                    <PriceCard
                        title="Professional"
                        price={79}
                        features={[
                            "1200 credits",
                            "High resolution",
                            "Commercial usage rights",
                        ]}
                        buttonText="Get Started"
                        isFeatured={true}
                        onButtonClick={handleGetStarted}
                    />

                    <PriceCard
                        title="Enterprise"
                        price={199}
                        features={[
                            "Custom credits",
                            "Customization features",
                            "Priority support",
                            "API access",
                            "White-label options"
                        ]}
                        buttonText="Coming Soon"
                        onButtonClick={() => console.log("Enterprise coming soon")}
                        disabled={true}
                    />
                </div>
            </div>
        </section>
    );
};

export default PricingSection; 