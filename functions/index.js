const functions = require("firebase-functions/v1"); // <- Forzamos el uso de la API clásica
const admin = require("firebase-admin");

const runtimeOpts = {
  timeoutSeconds: 300,
  memory: '256MB',
  nodejs: '22' 
};

admin.initializeApp();

const db = admin.firestore();

// 1. Registro automático cuando un usuario se crea en Firebase Auth
exports.initializeuserrole = functions.runWith(runtimeOpts).auth.user().onCreate(async (user) => {
    await db.collection('users').doc(user.uid).set({
        email: user.email,
        role: 'cliente',
        status: 'active',
        wallet_balance: 0,
        created_at: admin.firestore.FieldValue.serverTimestamp()
    });
});

// 2. Comisiones automáticas cuando un pedido pasa a "entregado"
exports.onorderdelivered = functions.firestore
    .document('orders/{orderId}')
    .onUpdate(async (change, context) => {
        const newData = change.after.data();
        const oldData = change.before.data();

        // Detectar si el estado cambió a 'entregado'
        if (newData.status === 'entregado' && oldData.status !== 'entregado') {
            const commission = newData.total * 0.10; // 10% de comisión
            const referralCode = newData.applied_code;

            if (referralCode) {
                const usersRef = db.collection('users');
                const userSnapshot = await usersRef.where('referral_code', '==', referralCode).get();
                
                if (!userSnapshot.empty) {
                    const userId = userSnapshot.docs[0].id;
                    await usersRef.doc(userId).update({
                        wallet_balance: admin.firestore.FieldValue.increment(commission)
                    });
                }
            }
        }
    });