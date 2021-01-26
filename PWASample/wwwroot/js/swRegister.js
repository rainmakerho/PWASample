const swRegister = (() => {
    if (!('serviceWorker' in navigator)) {
        return;
    };
    let serviceWorkerRegObj = undefined;
    const notificationButton = document.getElementById("btnNotify");
    const pushButton = document.getElementById("btnPush");
    let isUserSubscribed = false;

    const showNotificationButton = () => {
        notificationButton.style.display = "block";
        notificationButton.addEventListener('click', showNotification);
    }
    const showNotification = () => {
        const simpleTextNotification = reg => reg.showNotification('Client Notification');
        const customizedNotification = reg => {
            const options = {
                body: 'This is an important body!',
                icon: 'assets/apple-icon-180x180.png',
                actions: [
                    { action: 'search', title: 'try searching!' },
                    { action: 'close', title: 'do nothing' },
                ],
                data: {
                    notificationTime: Date.now(),
                    user: 'rainmaker'
                }
            }
            reg.showNotification('customized Notification', options);
        }
        navigator.serviceWorker.getRegistration()
            .then(registration => simpleTextNotification(registration));
        navigator.serviceWorker.getRegistration()
            .then(registration => customizedNotification(registration));
    }

    const checkNotificationSupport = () => {
        if (!('Notification' in window)) {
            return Promise.reject('The browser doesn\'t support notifications.');
            
        }
        console.log("The browser support Notifications!")
        return Promise.resolve('ok!');
    };

    const requestNotificationPermissions = () => {
        return Notification.requestPermission(status => {
            console.log("Notification Permission Status:", status);
        })
    };

    const registerServiceWorker = () => {
        return navigator.serviceWorker.register('sw.js')
            .then(regObj => {
                console.log('Service worker is registered successfully!');
                serviceWorkerRegObj = regObj;
                showNotificationButton();
                // {"endpoint":"https://fcm.googleapis.com/fcm/send/eJkxt_ReOpM:APA91bHEk1NnaX3v82C0bSQ_IRzIrcBQpH9PTbcJkJGEVV_UrfySYT9E-_NcDDcAXAflim8R0zE1NbdcbgAwUwPiNhDFFikltjK3IZfw5NU4uYpMwwAj0VhbXX7ZnbK-8Z0sOZznSSun","expirationTime":null,"keys":{"p256dh":"BMFz4NhKC7_dpylrqVyxmgMcJbodLfp8sXGrU5roS6wtE-jg_5wV-85RGHDMGE4Zk0uWoLc8mUqfk529MLKFTMs","auth":"rivZdEfF0U2cTnVldZFSfg"}}
                if (('PushManager' in window)) {
                    serviceWorkerRegObj.pushManager.getSubscription()
                        .then(subs => {
                            console.log('getSubscription:', subs)
                            if (subs) {
                                disablePushNotificationButton();
                                console.log('getSubscription:', JSON.stringify(subs));
                            }
                            else {
                                enablePushNotificationButton();
                            }
                        });
                } else {
                    pushButton.style.display = 'none';
                }
                
            })
    };

    registerServiceWorker()
        .then(checkNotificationSupport)
        .then(requestNotificationPermissions)
        .catch(err => console.error(err));

    const disablePushNotificationButton = () => {
        isUserSubscribed = true
        pushButton.innerText = "DISABLE PUSH NOTIFICATIONS"
        pushButton.className = "btn btn-warning"
    }

    const enablePushNotificationButton = () => {
        isUserSubscribed = false
        pushButton.innerText = "ENABLE PUSH NOTIFICATIONS"
        pushButton.className = "btn btn-success"
    }


    const setupPush = () => {
        function urlB64ToUint8Array(url) {
            const padding = '='.repeat((4 - url.length % 4) % 4);
            const base64 = (url + padding)
                .replace(/\-/g, '+')
                .replace(/_/g, '/');

            const rawData = window.atob(base64);
            const outputArray = new Uint8Array(rawData.length);

            for (let i = 0; i < rawData.length; ++i) {
                outputArray[i] = rawData.charCodeAt(i);
            }
            return outputArray;
        }

        const subscribeWithServer = (subscription) => {
            return fetch('/api/PushSubscriber', {
                method: 'POST',
                body: JSON.stringify(subscription),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
        }
        //https://github.com/web-push-libs
        const subscribeUser = () => {
            const appServerPublicKey = "BLhYVuGAKX2B7YAYZm4ZnCWkdxb3bz0hUldJ4kCl6pBLxBlrWeKRB-OJJ-b1IZXOmF83twBz8svJVwJmFNfwaH4";
            const publicKeyAsArray = urlB64ToUint8Array(appServerPublicKey)
            navigator.serviceWorker.getRegistration()
                .then(sr => {
                    sr.pushManager.subscribe({
                        userVisibleOnly: true,
                        applicationServerKey: publicKeyAsArray
                    }).then(subscription => {
                        console.log(JSON.stringify(subscription, null, 4))
                        subscribeWithServer(subscription)
                        disablePushNotificationButton();
                    })
                        .catch(error => console.error("Failed to subscribe to Push Service.", error))
                });
        }

        const unsubscribeWithServer = (id) => {
            return fetch('/api/PushSubscriber/'+ id, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
        }

        const unSubscribeUser = () => {
            console.log("un-subscribing user")
            navigator.serviceWorker.getRegistration()
                .then(sr => {
                    sr.pushManager.getSubscription()
                        .then(subscription => {
                            if (subscription) {
                                let subAsString = JSON.stringify(subscription);
                                let subAsObject = JSON.parse(subAsString)
                                unsubscribeWithServer(subAsObject.keys.auth)
                                return subscription.unsubscribe()
                            }
                        })
                        .then(enablePushNotificationButton)
                        .catch(error => console.error("Failed to unsubscribe from Push Service.", error))
                });
        }

        pushButton.addEventListener('click', () => {
            if (isUserSubscribed) unSubscribeUser()
            else subscribeUser();
        })
    }
    setupPush();

    //if (checkNotificationSupport()) {
    //    requestNotificationPermissions();
    //}

    ////console.log(swRegistration);
    //let serviceWorker;
    //if (swRegistration.installing) {
    //    console.log('Resolved on installing:', swRegistration);
    //    serviceWorker = swRegistration.installing;
    //} else if (swRegistration.waiting) {
    //    console.log('Resolved on installed/waiting:', swRegistration);
    //    serviceWorker = swRegistration.waiting;
    //} else if (swRegistration.active) {
    //    console.log('Resolved on activated:', swRegistration);
    //    serviceWorker = swRegistration.active;
    //}


    //serviceWorker.addEventListener('statechange', (event) => {
    //    console.log(event.target.state);
    //});

    //swRegistration.addEventListener('updatefound', () => {
    //    swRegistration.installing.addEventListener('statechange', (e) => {
    //        console.log('New service worker state: ', e.target.state)
    //    });
    //    console.log('New service worker found', swRegistration);
    //})

    ////exra event fired when service worker controlling this page 
    ////through the self.skipWaiting()
    //navigator.serviceWorker.addEventListener('controllerchange', () => {
    //    console.log('Controller Changed!')
    //});

    //setInterval(() => {
    //    swRegistration.update();
    //}, 1000 * 5);

    //navigator.serviceWorker.addEventListener('message', e => {
    //    const clientId = e.data.clientId;
    //    const message = e.data.message;
    //    console.log('From Client:', clientId, message);
    //});

    //if (navigator.serviceWorker.controller) {
    //    navigator.serviceWorker.controller.postMessage('hello');
    //}
})();
