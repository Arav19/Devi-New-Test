import admin from 'firebase-admin';
import { getBirthChart } from '../src/lib/astrology/birthchart';
import { BirthDetails } from '../src/types';

// Initialize Firebase Admin with ADC
admin.initializeApp({
  projectId: 'ask-devi',
  credential: admin.credential.applicationDefault()
});

const db = admin.firestore();

async function updateAllUserBirthCharts() {
  try {
    console.log('Starting birth chart updates...');
    const usersRef = db.collection('users');
    const snapshot = await usersRef.get();
    
    let successful = 0;
    let failed = 0;
    const errors: any[] = [];

    for (const userDoc of snapshot.docs) {
      const userData = userDoc.data();
      
      try {
        // Check for required birth data
        if (!userData.birthDate || !userData.birthTime || !userData.birthPlace) {
          console.log(`Skipping user ${userDoc.id}: Missing required birth data`);
          continue;
        }

        console.log(`Processing user ${userDoc.id}...`);
        
        // Format data for getBirthChart function
        const birthDetails: BirthDetails = {
          date: userData.birthDate,
          time: userData.birthTime,
          location: userData.birthPlace
        };

        // Calculate new birth chart
        const newBirthChart = await getBirthChart(birthDetails);

        // Update the user document
        await userDoc.ref.update({
          birthChart: newBirthChart,
          birthChartUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        successful++;
        console.log(`✅ Updated birth chart for user ${userDoc.id}`);
        
        // Add small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        failed++;
        errors.push({ 
          userId: userDoc.id, 
          error: error instanceof Error ? error.message : String(error),
          data: {
            birthDate: userData.birthDate,
            birthTime: userData.birthTime,
            birthPlace: userData.birthPlace
          }
        });
        console.error(`❌ Failed to update user ${userDoc.id}:`, error);
      }
    }

    // Print summary
    console.log('\nUpdate Summary:');
    console.log(`Total users processed: ${snapshot.size}`);
    console.log(`Successful updates: ${successful}`);
    console.log(`Failed updates: ${failed}`);
    
    if (errors.length > 0) {
      console.log('\nErrors encountered:');
      errors.forEach(({ userId, error, data }) => {
        console.log(`User ${userId}:`);
        console.log(`Error: ${error}`);
        console.log('Data:', data);
        console.log('---');
      });
    }

  } catch (error) {
    console.error('Script failed:', error);
  }
}

// Run the script
updateAllUserBirthCharts()
  .then(() => {
    console.log('Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  }); 