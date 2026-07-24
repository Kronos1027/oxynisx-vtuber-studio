// OXYNISX VTuber Studio - Tauri Backend
//
// Provides:
// - Window state persistence (position, size)
// - Global keyboard shortcuts (Ctrl+1..5 for expressions)
// - Window control commands (toggle always-on-top, toggle click-through,
//   set transparent, etc.)

use tauri::{Manager, WebviewWindow, Emitter};
use tauri_plugin_global_shortcut::{GlobalShortcutExt, Code, Modifiers, Shortcut, ShortcutState};

#[tauri::command]
fn toggle_always_on_top(window: WebviewWindow, enabled: Option<bool>) -> bool {
    let current = window.is_always_on_top().unwrap_or(false);
    let new_state = enabled.unwrap_or(!current);
    let _ = window.set_always_on_top(new_state);
    new_state
}

#[tauri::command]
fn toggle_click_through(window: WebviewWindow, enabled: Option<bool>) -> bool {
    let current = window.is_ignore_cursor_events().unwrap_or(false);
    let new_state = enabled.unwrap_or(!current);
    let _ = window.set_ignore_cursor_events(new_state);
    new_state
}

#[tauri::command]
fn toggle_decorations(window: WebviewWindow, enabled: Option<bool>) -> bool {
    let current = window.is_decorated().unwrap_or(false);
    let new_state = enabled.unwrap_or(!current);
    let _ = window.set_decorations(new_state);
    new_state
}

#[tauri::command]
fn set_window_transparent(window: WebviewWindow) -> Result<(), String> {
    // On Windows, we can use set_effects for acrylic/mica transparency
    // For now, the window is already transparent via tauri.conf.json
    let _ = window;
    Ok(())
}

#[tauri::command]
fn bring_to_front(window: WebviewWindow) {
    let _ = window.set_focus();
}

#[tauri::command]
fn minimize_to_tray(window: WebviewWindow) {
    let _ = window.hide();
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .plugin(tauri_plugin_global_shortcut::Builder::default().build())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            // Register global shortcuts for expressions (Ctrl+1..5)
            let app_handle = app.handle().clone();
            if let Some(shortcut_plugin) = app.try_global_shortcut() {
                for i in 1..=5u8 {
                    let shortcut = Shortcut::new(Some(Code::Digit1 + (i - 1)), Modifiers::CONTROL);
                    let handle = app_handle.clone();
                    let _ = shortcut_plugin.register(shortcut, move |_app, _shortcut, event| {
                        if event.state == ShortcutState::Pressed {
                            let _ = handle.emit("global-expression", i);
                        }
                    });
                }
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            toggle_always_on_top,
            toggle_click_through,
            toggle_decorations,
            set_window_transparent,
            bring_to_front,
            minimize_to_tray,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
