const fs = require('fs');
const path = './src/screens/Profile/ProfileScreen.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Remove the injected label block from confirmLogout
content = content.replace(/    \n  modalOverlay: \{[\s\S]*?marginBottom: 12,\n  \}\n/g, "    });\n  };\n");

// 2. Add the styles correctly to the end of StyleSheet.create
const correctStyles = `
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    alignItems: 'center',
    paddingBottom: 40,
    width: '100%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
    marginBottom: 24,
  },
  modalIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalSubtitle: {
    textAlign: 'center',
    fontSize: 15,
    marginBottom: 32,
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  modalBtn: {
    width: '100%',
    marginBottom: 12,
  }
});
`;

content = content.replace(/  logoutText: \{\n    fontSize: 16,\n    fontWeight: '600',\n  \}\n\}\);/g, `  logoutText: {\n    fontSize: 16,\n    fontWeight: '600',\n  },${correctStyles}`);

fs.writeFileSync(path, content, 'utf8');
console.log('Done fixing profile syntax');
