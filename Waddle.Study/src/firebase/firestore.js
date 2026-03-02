import {
    doc, getDoc, setDoc, updateDoc, deleteDoc,
    collection, query, where, getDocs, addDoc,
    arrayUnion, arrayRemove, increment, serverTimestamp,
    runTransaction
} from 'firebase/firestore';
import { db } from './config';
import { THE_CLASSIC } from '../data/duckDatabase';

// Create the starter duck instance for new users
function createClassicDuck() {
    return {
        instanceId: `duck_classic_starter`,
        duckId: THE_CLASSIC.id,
        name: THE_CLASSIC.name,
        rarity: THE_CLASSIC.rarity,
        color: THE_CLASSIC.color,
        isDazzling: false,
        obtainedAt: Date.now(),
    };
}

// ─── User Operations ───────────────────────────────────────────────
export async function createUser(uid, role, displayName) {
    const classicDuck = createClassicDuck();
    await setDoc(doc(db, 'users', uid), {
        role,
        profile: { displayName, displayDuckId: classicDuck.instanceId },
        economy: { duckBucks: 0 },
        inventory: { ducks: [classicDuck], eggs: [] },
        enrolledDojos: [],
        createdAt: serverTimestamp(),
    });
}

export async function getUser(uid) {
    const snap = await getDoc(doc(db, 'users', uid));
    return snap.exists() ? { uid, ...snap.data() } : null;
}

export async function updateUser(uid, data) {
    await updateDoc(doc(db, 'users', uid), data);
}

export async function addDuckBucks(uid, amount) {
    await updateDoc(doc(db, 'users', uid), {
        'economy.duckBucks': increment(amount),
    });
}

export async function spendDuckBucks(uid, amount) {
    const userRef = doc(db, 'users', uid);
    try {
        await runTransaction(db, async (transaction) => {
            const snap = await transaction.get(userRef);
            if (!snap.exists()) throw new Error('User not found');
            const current = snap.data().economy?.duckBucks || 0;
            if (current < amount) throw new Error('Insufficient funds');
            transaction.update(userRef, { 'economy.duckBucks': increment(-amount) });
        });
        return true;
    } catch {
        return false;
    }
}

export async function addDuckToInventory(uid, duck) {
    await updateDoc(doc(db, 'users', uid), {
        'inventory.ducks': arrayUnion(duck),
    });
}

export async function addEggToInventory(uid, egg) {
    await updateDoc(doc(db, 'users', uid), {
        'inventory.eggs': arrayUnion(egg),
    });
}

export async function removeEggFromInventory(uid, egg) {
    await updateDoc(doc(db, 'users', uid), {
        'inventory.eggs': arrayRemove(egg),
    });
}

export async function setDisplayDuck(uid, duckInstanceId) {
    await updateDoc(doc(db, 'users', uid), {
        'profile.displayDuckId': duckInstanceId,
    });
}

// ─── Dojo Operations ───────────────────────────────────────────────
function generateJoinCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 5; i++) code += chars[Math.floor(Math.random() * chars.length)];
    return code;
}

export async function createDojo(teacherId, teacherName, dojoName) {
    const joinCode = generateJoinCode();
    const ref = await addDoc(collection(db, 'dojos'), {
        dojoName,
        joinCode,
        teacherId,
        teacherName,
        studentList: [],
        activeAssignments: [],
        createdAt: serverTimestamp(),
    });
    return { dojoId: ref.id, joinCode };
}

export async function getDojoByCode(joinCode) {
    const q = query(collection(db, 'dojos'), where('joinCode', '==', joinCode.toUpperCase()));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const d = snap.docs[0];
    return { dojoId: d.id, ...d.data() };
}

export async function getDojo(dojoId) {
    const snap = await getDoc(doc(db, 'dojos', dojoId));
    return snap.exists() ? { dojoId, ...snap.data() } : null;
}

export async function joinDojo(studentUid, dojoId) {
    await updateDoc(doc(db, 'dojos', dojoId), {
        studentList: arrayUnion(studentUid),
    });
    await updateDoc(doc(db, 'users', studentUid), {
        enrolledDojos: arrayUnion(dojoId),
    });
}

export async function getTeacherDojos(teacherId) {
    const q = query(collection(db, 'dojos'), where('teacherId', '==', teacherId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ dojoId: d.id, ...d.data() }));
}

export async function addAssignment(dojoId, assignment) {
    const dojo = await getDojo(dojoId);
    if (!dojo) return;
    const updated = [...(dojo.activeAssignments || []), assignment];
    await updateDoc(doc(db, 'dojos', dojoId), { activeAssignments: updated });
}

export async function removeAssignment(dojoId, contentId) {
    const dojo = await getDojo(dojoId);
    if (!dojo) return;
    const updated = (dojo.activeAssignments || []).filter(a => a.contentId !== contentId);
    await updateDoc(doc(db, 'dojos', dojoId), { activeAssignments: updated });
}

export async function removeStudentFromDojo(dojoId, studentUid) {
    await updateDoc(doc(db, 'dojos', dojoId), {
        studentList: arrayRemove(studentUid),
    });
    await updateDoc(doc(db, 'users', studentUid), {
        enrolledDojos: arrayRemove(dojoId),
    });
}

// ─── Question Set Operations ───────────────────────────────────────
export async function createQuestionSet(authorId, authorRole, title, questions) {
    const ref = await addDoc(collection(db, 'questionSets'), {
        title,
        authorId,
        authorRole,
        isVerified: false,
        isPublic: authorRole === 'teacher',
        questions,
        availableModes: ['StandardQuiz'],
        createdAt: serverTimestamp(),
    });
    return ref.id;
}

export async function getQuestionSet(setId) {
    const snap = await getDoc(doc(db, 'questionSets', setId));
    return snap.exists() ? { setId, ...snap.data() } : null;
}

export async function getVerifiedSets() {
    const q = query(collection(db, 'questionSets'), where('isVerified', '==', true));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ setId: d.id, ...d.data() }));
}

export async function getUserSets(authorId) {
    const q = query(collection(db, 'questionSets'), where('authorId', '==', authorId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ setId: d.id, ...d.data() }));
}

export async function updateQuestionSet(setId, data) {
    await updateDoc(doc(db, 'questionSets', setId), data);
}

export async function deleteQuestionSet(setId) {
    await deleteDoc(doc(db, 'questionSets', setId));
}

// ─── Whitelist / Admin Operations ──────────────────────────────────
export async function getWhitelist() {
    const snap = await getDoc(doc(db, 'globalState', 'whitelist'));
    if (!snap.exists()) return { teacherDojoAccess: [], verifiedSets: [], adminUids: [] };
    return snap.data();
}

export async function isTeacherWhitelisted(uid) {
    const wl = await getWhitelist();
    return (wl.teacherDojoAccess || []).includes(uid);
}

export async function isAdmin(uid) {
    const wl = await getWhitelist();
    return (wl.adminUids || []).includes(uid);
}

export async function whitelistTeacher(uid) {
    await setDoc(doc(db, 'globalState', 'whitelist'), {
        teacherDojoAccess: arrayUnion(uid),
    }, { merge: true });
}

export async function verifyQuestionSet(setId) {
    await updateDoc(doc(db, 'questionSets', setId), { isVerified: true });
}

// ─── Quiz Results ──────────────────────────────────────────────────
export async function saveQuizResult(uid, result) {
    await addDoc(collection(db, 'quizResults'), {
        uid,
        ...result,
        completedAt: serverTimestamp(),
    });
}

export async function getStudentResults(uid) {
    const q = query(collection(db, 'quizResults'), where('uid', '==', uid));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ resultId: d.id, ...d.data() }));
}

export async function getDojoResults(dojoId) {
    const q = query(collection(db, 'quizResults'), where('dojoId', '==', dojoId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ resultId: d.id, ...d.data() }));
}

// ─── Daily Shop ────────────────────────────────────────────────────
export async function getDailyShop() {
    const snap = await getDoc(doc(db, 'globalState', 'dailyShop'));
    return snap.exists() ? snap.data() : null;
}

export async function setDailyShop(shopData) {
    await setDoc(doc(db, 'globalState', 'dailyShop'), shopData);
}
