using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace PWASample.Pages
{
    public class IndexModel : PageModel
    {
        private readonly ILogger<IndexModel> _logger;

        

        public IndexModel(ILogger<IndexModel> logger)
        {
            _logger = logger;
        }

        [BindProperty]
        public string UserId { get; set; }

        public void OnGet()
        {}

        public async Task<IActionResult> OnPostAsync()
        {
            var claims = new List<Claim>
                    {
                        new Claim(ClaimTypes.Name,UserId),
                    };
            var claimsIdentity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
            const string demoIssuerAndAudience = "https://www.rmtech.com";
            const string jwtDemoSec = "pwa sample write by rainmaker";
            var authSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtDemoSec));
            var token = new JwtSecurityToken(
                issuer: demoIssuerAndAudience,
                audience: demoIssuerAndAudience,
                expires: DateTime.Now.AddHours(3),
                claims: claims,
                signingCredentials: new SigningCredentials(authSigningKey, SecurityAlgorithms.HmacSha256)
                );
            var authProperties = new AuthenticationProperties();
            authProperties.StoreTokens(new List<AuthenticationToken>()
                {
                    new AuthenticationToken
                    {
                        Name = OpenIdConnectParameterNames.AccessToken,
                        Value = new JwtSecurityTokenHandler().WriteToken(token)
                    }
                });


            await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, new ClaimsPrincipal(claimsIdentity), authProperties);
            return RedirectToPage("/Photo");
        }
    }
}
