package com.doready.app;

import android.os.Bundle;
import android.content.res.Configuration;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(SystemThemePlugin.class);
        super.onCreate(savedInstanceState);
    }
}

@CapacitorPlugin(name = "SystemTheme")
class SystemThemePlugin extends Plugin {
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
