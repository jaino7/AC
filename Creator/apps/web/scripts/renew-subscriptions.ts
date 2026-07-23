/**
 * Manual subscription renewal script for local development
 *
 * Usage:
 *   npx tsx apps/web/scripts/renew-subscriptions.ts
 */

async function renewSubscriptions() {
    try {
        console.log("Starting subscription renewal...");

        const response = await fetch("http://localhost:3000/api/cron/renew-subscriptions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                // In production, add: "Authorization": `Bearer ${process.env.CRON_SECRET}`
            },
        });

        const result = await response.json();

        if (!response.ok) {
            console.error("Renewal failed:", result);
            process.exit(1);
        }

        console.log("Renewal completed successfully:");
        console.log(`Total subscriptions: ${result.results.total}`);
        console.log(`Renewed: ${result.results.renewed}`);
        console.log(`Cancelled: ${result.results.cancelled}`);
        console.log(`Errors: ${result.results.errors}`);

        if (result.results.details.length > 0) {
            console.log("\nDetails:");
            result.results.details.forEach((detail: any) => {
                console.log(`- ${detail.planName}: ${detail.status}`);
            });
        }
    } catch (error) {
        console.error("Error running renewal script:", error);
        process.exit(1);
    }
}

renewSubscriptions();
