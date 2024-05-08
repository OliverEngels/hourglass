const { Menu, MenuItem } = require('electron');

const createLoggerWindow = require('./screens/loggerWindow');
const createEntriesWindow = require('./screens/entriesWindow');
const createTagsWindow = require('./screens/tagsWindow');

module.exports = function SetupSettings(dev) {
    const settingsMenu = new Menu();

    settingsMenu.append(new MenuItem({
        label: 'Time Logger',
        click: () => { createLoggerWindow(dev); }
    }));

    settingsMenu.append(new MenuItem({
        label: 'Entries',
        click: () => { createEntriesWindow(dev); }
    }));

    settingsMenu.append(new MenuItem({
        label: 'Add/Edit Tags',
        click: () => { createTagsWindow(); }
    }));

    const settingsMenuItem = new MenuItem({
        label: 'Menu',
        submenu: settingsMenu
    });

    const menu = Menu.getApplicationMenu() || new Menu();
    menu.append(settingsMenuItem);

    Menu.setApplicationMenu(menu);
}