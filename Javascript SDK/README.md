##Prerequisites
Clone this repo or [download here](https://github.com/midversestudios/AppEngage/archive/master.zip)

**ATTENTION**: JQuery is required. 

Import the following files at the top of your page's <head>:
+ **AppEngage-1.00.js**
 
If you are publishing the **AppEngage Dialog**, complete the following steps:

1.	Setup **App** and **Engagement Actions**.  Make sure that your app and engagement actions are set up in the dashboard correctly at engage.pxladdicts.com.

##Setting up your device for testing 

Before you begin, make sure your application is set up correctly on the AppEngage dashboard at engage.pxladdicts.com. Add your test account’s **UNIQUE_USER_ID** to the list of test devices on the AppEngage dashboard. 


##Let's start up the AppEngage SDK!

In your **<head>**:

Initialize our SDK with your app's APP Key from our dashboard: 
```javascript
        AppEngage.initializeApp("YOUR_APP_API_KEY", "YOUR_USERS_FACEBOOK_ID");
```

The SDK needs an instance of the window so we can handle certain events correctly.  Place this snippit below.
```javascript
        AppEngage.setUpEventHandlerForWindow(window);
```

Set up a block to be notified when your user earns currency.
```javascript
AppEngage.setCurrencyRewardHandler(function (currency_amount, claim_token){
            console.log('Your user just claimed ' + currency_amount + ' currency!  ' +
                        'You can now call your server to add the currency.  ' +
                        'It is recommended for security purposes that your server makes a request to our server to verify the claim_token.  ' +
                        'Read more here: http://engage.pxladdicts.com/dashboard.html#/docs.  ' +
                        'This transaction\'s claim_token is:'  + claim_token);
        });
```

##Showing the AppEngage Dialog

To show the AppEngage dialog call:
```objective-c
[MVAppEngage showEngagementDialog];
```

##Completing Engagement Actions
To complete an action add the below line when the action requirements are completed in your app. Pass the action type as the parameter.

```objective-c
[MVAppEngage userPerformedEngagementAction:@"THE_ACTION"];
```
	
Built in Engagement Actions:

| Action        | Description   |
| ------------- |:------------- |
| "LevelUp"     | Called each time your user levels up |
| "Win"      | Called each time your user wins      |
| "Play" |  Called each time your user plays a round      |
| "Buy" | Called each time your user buys an item      |
| "Use" | Called each time your user uses an item (i.e. power up)     |
| "Share" | Called each time your user shares on a social network     |

You can also create custom action types on the campaign editor.


##Server Currency Verification
Publishers are able to verify currency claims by making a call to the following URL:
	http://engage.pxladdicts.com/engage/verifycurrencyclaimtoken/token/TOKEN_FROM_SDK
	Parameters:
	**TOKEN_FROM_SDK** - token is provided by the client-side SDK on every rewarding of currency

```json
	{"result": {"token_verified": 0 or 1, "claimed": 0 or 1, "currency_amount":0 or more}}
```

To prevent fraud, you should give currency to the user only server-side, and only when **token_verified** is 1 and claimed is 0

##Sample App

If you have any issues take a look at how the SampleApp works. If you still having issues contact your representative with specific questions and we will be happy to help.
