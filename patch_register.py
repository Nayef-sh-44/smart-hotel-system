import re

with open('frontend/src/pages/Register.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("Hotel, User, Mail, Lock, Phone, ArrowRight, ShieldQuestion", "Hotel, User, Mail, Lock, Phone, ArrowRight, ShieldQuestion, Eye, EyeOff")

content = content.replace("const navigate = useNavigate();", "const navigate = useNavigate();\n  const [showPassword, setShowPassword] = useState(false);")

old_input = '''<input type="password" name="password" required minLength="6" value={formData.password} onChange={handleChange} placeholder="••••••••" className="input-field pl-10 text-sm" />'''
new_input = '''<input type={showPassword ? 'text' : 'password'} name="password" required minLength="6" value={formData.password} onChange={handleChange} placeholder="••••••••" className="input-field pl-10 pr-10 text-sm" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>'''
                
content = content.replace(old_input, new_input)

with open('frontend/src/pages/Register.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Register.jsx patched successfully.")
