/**
 * AppEngage v1.00
 */
 
function AppEngage() {

}

//
//Internal Helpers
//
var zzzAppEngageDebugMode = false;
var zzzAppEngageUseLocalHost = false;
var zzzAppEngageSDKVersion = '1.00';

//
//Static SDK Vars
//

AppEngage.appEngageApiKey = null;
AppEngage.appEngageFacebookID = null;
AppEngage.appEngageDialogIsAvailable = false;
AppEngage.appEngageCurrencyRewardHandler = null;

//
//Public SDK Calls
//

AppEngage.initializeApp = function (key, fbid) {
    AppEngage.appEngageApiKey = key;
    AppEngage.appEngageFacebookID = fbid;

    //Has this user been registered?
    var registered = localStorage.getItem("app_engage_user_has_registered");
    if(registered){
        AppEngage.__loginAppEngageUser();
    }
    else{
        //We will register the user first, then call login
        AppEngage.__createAppEngageUser();
    }
};

AppEngage.setUpEventHandlerForWindow = function(theWindow){
    var eventMethod = theWindow.addEventListener ? "addEventListener" : "attachEvent";
    var eventer = theWindow[eventMethod];
    var messageEvent = eventMethod == "attachEvent" ? "onmessage" : "message";

    //Listen to message from child window
    eventer(messageEvent,function(e) {
        var message = e.data ? e.data : e.message;

        if(message == 'AppEngage:Dismiss-Dialog' || message == 'Hello Parent Frame!'){
            AppEngage.hideDialog();
        }

        if(zzzAppEngageDebugMode){
            console.log('AppEngage Event Received: ' + message + ' from origin ' + e.origin);
        }

    },false);
};

AppEngage.isDialogAvailable = function(){
    return AppEngage.appEngageDialogIsAvailable;
};

AppEngage.showDialog = function () {
    if(!AppEngage.appEngageDialogIsAvailable){
        console.log('AppEngage: The AppEngage Dialog is not available at the moment');
        return;
    }

    //Make sure we hide the current iframe if it is showing
    AppEngage.hideDialog();

    var iframeHtml = AppEngage.__appEngageDialogiFrame();
    $('#appengage-root').append(iframeHtml);
};

AppEngage.userPerformedEngagementAction = function (action) {
    var params = AppEngage.__getDefaultAppEngageParams();
    params["action_name"] = action;
    var url = AppEngage.__getAppEngageURL("completeaction", params);
    AppEngage.__appEngageGETRequest(url, null);
};

AppEngage.hideDialog = function () {
    $('#appengage-curtain').remove();

    //Check for pending rewards
    AppEngage.getPendingRewards();
};

AppEngage.getPendingRewards = function () {
    var params = AppEngage.__getDefaultAppEngageParams();
    var url = AppEngage.__getAppEngageURL("getpendingrewards", params);
    AppEngage.__appEngageGETRequest(url, function (data){
        var success = data["success"];
        if(success){
            var currency_amount = data["currency_amount"];
            var currency_claim_token = data["currency_claim_token"];
            if(currency_amount && currency_claim_token){
                if(AppEngage.appEngageCurrencyRewardHandler){
                    AppEngage.appEngageCurrencyRewardHandler(currency_amount, currency_claim_token);
                }
            }
        }
    });
};

AppEngage.setCurrencyRewardHandler = function (handler){
    AppEngage.appEngageCurrencyRewardHandler = handler;
    console.log('AppEngage is now set up to handle currency rewards');
};

//
//Private AppEngage Calls
//

AppEngage.__createAppEngageUser =  function () {
    //create user
    var params = AppEngage.__getDefaultAppEngageParams()
    var url = AppEngage.__getAppEngageURL("create", params);
    AppEngage.__appEngageGETRequest(url, function (data){
        localStorage.setItem('app_engage_user_has_registered', 'YES');
        AppEngage.__loginAppEngageUser();
    });
};

AppEngage.__loginAppEngageUser =  function () {
    //create user
    var params = AppEngage.__getDefaultAppEngageParams()
    var url = AppEngage.__getAppEngageURL("login", params);
    AppEngage.__appEngageGETRequest(url, function(data){
        if(!data.hasOwnProperty('prompt')){
            if(data["success"] == 1){
                AppEngage.appEngageDialogIsAvailable = true;
            }
        }

        //Check for pending rewards
        AppEngage.getPendingRewards();
    });
};


//
//Private HTTP Helpers
//

AppEngage.__getAppEngageURL = function (action, params)
{
    //Base
    var url = "//engage.pxladdicts.com/engage/";
    if(zzzAppEngageUseLocalHost){
        url = '/engage/';
    }

    //Action
    url += action;

    //Append the backslash to get ready for the params
    url = url + '?';

    //Append the params
    if (params) {
        for (var paramKey in params) {
            var paramValue = params[paramKey];
            url = url + paramKey + '=' + paramValue;
            url = url  + '&';
        }
        url = url.substring(0, url.length - 1);
    }

    return url;
};

AppEngage.__getDefaultAppEngageParams = function (){
    var params = new Array();
    params["api_key"] = AppEngage.appEngageApiKey;
    params["fbid"] = AppEngage.appEngageFacebookID;
    params["identifier"] = AppEngage.appEngageFacebookID;
    params["platform"] = "facebook";
    params["version"] = zzzAppEngageSDKVersion;

    return params;
};

AppEngage.__appEngageGETRequest = function (theUrl, callback)
{
    jQuery.ajax({
        url:theUrl,
        type: 'GET',
        success:function(data, textStatus, jqXHR) {
            var json = JSON.parse(data);
            var result = json["result"];

            if(callback){
                callback(result);
            }

            if(zzzAppEngageDebugMode){
                console.log('URL: ' + theUrl);
                console.log('RESPONSE: ' + data);
            }
        }
    })
};


//
//Private AppEngage iFrame
//

AppEngage.__appEngageDialogiFrame = function () {
    var height = $(document).height();
    var width = $(document).width();

    var styles = new Array();
    styles["position"] = 'absolute';
    styles['width'] = width + 'px';
    styles['height'] = height + 'px';
    styles['z-index'] = '1020203032';
    styles['background'] = 'rgba(0, 0, 0, .65)';

    var iframeStyle = AppEngage.__cssStyleBuilder(styles);

    var iframeURL = "//engage.pxladdicts.com/app-engage-web-dialog.php";
    if(zzzAppEngageUseLocalHost){
        iframeURL = "http://engage.localhost:8080/app-engage-web-dialog.php";
    }

    iframeURL += "?api_key=" + AppEngage.appEngageApiKey;
    iframeURL += "&identifier=" + AppEngage.appEngageFacebookID;
    iframeURL += "&platform=facebook";

    var html = '<div id=\"appengage-curtain\" style=\"' + iframeStyle +'\">';
    html +=         '<iframe id=\"appengage-iframe\" scrolling=\"no\" src=\"' + iframeURL + '" frameborder=\"no\" align=\"middle\" style=\"width: 720px; height: 472px; display: block; z-index: 102023332; position: relative; margin-left: auto; margin-right: auto; top: 5%; overflow:hidden;\"></iframe>';
    html +=     '</div>';

    return html;
};

AppEngage.__cssStyleBuilder = function(styles){
    var css = '';
    for (var styleKey in styles) {
        var styleValue = styles[styleKey];
        css += styleKey + ':' + styleValue + '; ';
    }
    return css;
};