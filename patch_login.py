import re

with open('frontend/src/pages/Login.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("Hotel, Mail, Lock, ArrowRight", "Hotel, Mail, Lock, ArrowRight, Eye, EyeOff")

content = content.replace("const [loading, setLoading] = useState(false);", "const [loading, setLoading] = useState(false);\n  const [showPassword, setShowPassword] = useState(false);\n  const [showNewPassword, setShowNewPassword] = useState(false);\n  const [showConfirmPassword, setShowConfirmPassword] = useState(false);")

# Main password input
content = content.replace('''<input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input-field pl-10 text-sm"
                  />''', '''<input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input-field pl-10 pr-10 text-sm"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>''')

# New password input
content = content.replace('''<input type="password" name="new_password" required value={forgotData.new_password} onChange={handleForgotChange} placeholder="********" className="input-field text-sm" />''', '''<div className="relative">
                    <input type={showNewPassword ? 'text' : 'password'} name="new_password" required value={forgotData.new_password} onChange={handleForgotChange} placeholder="********" className="input-field pr-10 text-sm" />
                    <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none">
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>''')

# Confirm password input
content = content.replace('''<input type="password" name="confirm_password" required value={forgotData.confirm_password} onChange={handleForgotChange} placeholder="********" className="input-field text-sm" />''', '''<div className="relative">
                    <input type={showConfirmPassword ? 'text' : 'password'} name="confirm_password" required value={forgotData.confirm_password} onChange={handleForgotChange} placeholder="********" className="input-field pr-10 text-sm" />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none">
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>''')

with open('frontend/src/pages/Login.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Login.jsx patched successfully.")
