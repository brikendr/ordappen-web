import * as functions from 'firebase-functions';
import * as firebase from 'firebase';
import { config } from './../../config/firestore_config';
import MersenneTwister from './MersenneTwister';

firebase.initializeApp({
  apiKey: config.apiKey,
  authDomain: config.authDomain,
  databaseURL: config.databaseURL,
  projectId: config.projectId,
  storageBucket: config.storageBucket,
  messagingSenderId: config.messagingSenderId
});

const db = firebase.firestore();
const randGen = new MersenneTwister();
const MAX_RETRIES = 10;

async function getTodaysUserWord (userDoc: any): Promise<any> {
  return {
    todays_word: "this is the word",
    this_week: []
  };
}

async function getRandomWordFromDictionary (wordExlcudeList: Array<String>, retryCount: number): Promise<any> {
  const random = randGen.genrand_int32();
  let queryRef = await  db.collection('dictionary')
    .where('random', '>', random)
    .orderBy('random', 'asc')
    .limit(1)
    .get();

  if (queryRef.size === 0) {
    queryRef = await db.collection('dictionary')
      .where('random', '<=', random)
      .orderBy('random', 'desc')
      .limit(1)
      .get();
  }
  const wordRef = queryRef.docs[0];

  if (wordExlcudeList.indexOf(wordRef.id) > -1 && retryCount > 0) {
    console.log(':: Recursion! Retries left: ', (retryCount - 1));
    return getRandomWordFromDictionary(wordExlcudeList, (retryCount - 1));
  }
  return wordRef.id;
}

async function userDailyWordUpdate (change: any, context: any): Promise<void> {
  const documentData = change.after.data();
  const dailyWordRef = change.after.ref;

  if (documentData.should_update) {
    let weeklyWordList: Array<String> = documentData.this_week.slice();
    weeklyWordList.push(documentData.todays_word);
    if (new Date().getDay() === 7) {
      console.log('--------------------------- Hurra it\'s SUNDAY! Emptying the list');
      weeklyWordList = [];
    }
    const randWordId = await getRandomWordFromDictionary(weeklyWordList, MAX_RETRIES);
    db.collection('dailyword').doc(dailyWordRef.id).update({
      should_update: false,
      todays_word: randWordId,
      added_on: new Date().getTime(),
      this_week: weeklyWordList
    }).then((entryRef: any) => console.log(`Successfully updated the new dailyword for user ${dailyWordRef.id}`))
      .catch((e: any) => {
        console.log('!!! Error !!! Failed select a new daily word for user!');
        console.log(e);
      });
  }
}

async function onNewUserCreated (snap: any, context: any): Promise<void> {
  db.collection('dailyword').doc(snap.id).set(getTodaysUserWord(snap.id))
  .then((entryRef: any) => console.log(`Daily word entry for ${snap.id} has been added!`)
  ).catch((e: any) => {
    console.log('!!! Error !!! Failed to add a new dailyword entry for user!');
    console.log(e);
  });
}

async function onNewWord (snap: any, context: any): Promise<void> {
  const random = randGen.genrand_int32();
  db.collection('dictionary').doc(snap.id).update({
    random
  }).then((entryRef: any) => console.log(`Generated random int ${random} for word document ${snap.id}!`))
  .catch((e: any) => {
    console.log('!!! Error !!! Failed to generate random id for dictionary entry!');
    console.log(e);
  });
}

exports.updateDailyWord = functions.firestore
  .document('dailyword/{userId}')
  .onUpdate(userDailyWordUpdate)

exports.createUser = functions.firestore
  .document('users/{userId}')
  .onCreate(onNewUserCreated);

exports.createDictionary = functions.firestore
  .document('dictionary/{dictionaryId}')
  .onCreate(onNewWord);