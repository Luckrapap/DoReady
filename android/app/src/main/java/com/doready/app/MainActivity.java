package com.doready.app;

import android.os.Bundle;
import android.content.res.Configuration;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(SystemThemePlugin.class);
        super.onCreate(savedInstanceState);
        
        // Configurar el WebViewClient para manejar errores de conexión
        this.bridge.getWebView().setWebViewClient(new WebViewClient() {
            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                super.onReceivedError(view, request, error);
                
                // Si el error es en el frame principal (la carga de la página), mostramos el offline.html
                if (request.isForMainFrame()) {
                    view.loadUrl("file:///android_asset/public/offline.html");
                }
            }

            @SuppressWarnings("deprecation")
            @Override
            public void onReceivedError(WebView view, int errorCode, String description, String failingUrl) {
                super.onReceivedError(view, errorCode, description, failingUrl);
                // Soporte para versiones antiguas de Android
                view.loadUrl("file:///android_asset/public/offline.html");
            }
        });
    }
}

@CapacitorPlugin(name = "SystemTheme")
public class SystemThemePlugin extends Plugin {
    @PluginMethod
    public void getTheme(PluginCall call) {
        JSObject ret = new JSObject();
        int nightModeFlags = getContext().getResources().getConfiguration().uiMode & Configuration.UI_MODE_NIGHT_MASK;
        
        switch (nightModeFlags) {
            case Configuration.UI_MODE_NIGHT_YES:
                ret.put("value", "dark");
                break;
            case Configuration.UI_MODE_NIGHT_NO:
                ret.put("value", "light");
                break;
            default:
                ret.put("value", "undefined");
                break;
        }
        call.resolve(ret);
    }
}
