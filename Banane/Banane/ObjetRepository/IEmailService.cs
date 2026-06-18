using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Banane.ObjetRepository
{
    public interface IEmailService
    {
        Task SendCredentialsAsync(string email, string password, string type);
        
    }
}
