using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Mail;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;

namespace Banane.ObjetRepository
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _config;

        public EmailService(IConfiguration config) => _config = config;

        public async Task SendCredentialsAsync(string email, string password, string type)
        {
            var smtp = _config.GetSection("Smtp");
            using var personne = new SmtpClient(smtp["Host"], int.Parse(smtp["Port"]))
            {
                Credentials = new NetworkCredential(smtp["User"], smtp["Pass"]),
                EnableSsl = true,
            };

            var body = $@"
            <h2>Bienvenue Sur La Platforme Scolaire UPF</h2>
            <p>Votre compte {type}   a été créé.</p>
            <p><strong>Email :</strong> {email}</p>
            <p><strong>Mot de passe temporaire :</strong> {password}</p>
            <p>Connectez-vous, Nous vous attendons .</p>
        ";

            var message = new MailMessage
            {
                From = new MailAddress(smtp["User"], "UPF"),
                Subject = "Vos Identifiant de Connection",
                Body = body,
                IsBodyHtml = true,
            };
            message.To.Add(email);

            await personne.SendMailAsync(message);
        }
    }
}
