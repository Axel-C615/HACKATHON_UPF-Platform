using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;
using Banane.DataObject;
using Banane.ObjetMetier;
using Microsoft.EntityFrameworkCore;



using static System.Runtime.InteropServices.JavaScript.JSType;

namespace Banane.ObjetService
{
    public class RepositoryService <T> : IRepositoryService <T> where T : class
    {
        protected readonly BananeDb _context;
        protected readonly DbSet<T> _dbSet;
        //public PERSONNE P;

        public RepositoryService(BananeDb createtable)
        {
            _context = createtable;
            _dbSet = _context.Set<T>();
        }

        public async Task<T?> GetByIdAsyncGuid(Guid id)
        {
            // Utilise FindAsync pour retrouver l'entité par clé primaire
            return await _dbSet.FindAsync(id);
        }
        public async Task<T?> GetByIdAsync(int id)
        {
            // Utilise FindAsync pour retrouver l'entité par clé primaire
            return await _dbSet.FindAsync(id);
        }
       

        public async Task<IEnumerable<T>> GetByConditionAsync(Expression<Func<T, bool>> expression)
        {
            return await _dbSet.Where(expression).ToListAsync();
        }

        public async Task<IEnumerable<T>> ListAsync()
        {
            // Retourne toutes les entités de la table
            return await _dbSet.ToListAsync();
        }

        public async Task AddAsync(T entity)
        {
            // Marque l'entité pour insertion en base
            await _dbSet.AddAsync(entity);
        }

        public void Update(T entity)
        {
            // Indique à EF que l'entité a été modifiée
            _dbSet.Update(entity);
        }


        public void Delete(T entity)
        {
            // Marque l'entité pour suppression en base
            _dbSet.Remove(entity);
        }
        

        public async Task SaveChangesAsync()
        {
            // Délègue à EF Core l’écriture en base de toutes les modifications
            await _context.SaveChangesAsync();
        }


        public async Task<object?> FindByEmailAsync(string email)
        {

            // Vérifie si le type est bien Patient
            if (typeof(T) == typeof(ADMINISTRATEUR))
            {
                var query = _dbSet.Cast<ADMINISTRATEUR>();
                return await query.FirstOrDefaultAsync(p => p.Email.Equals(email));
            }
            else if (typeof(T) == typeof(ENSEIGNANT))
            {
                var query = _dbSet.Cast<ENSEIGNANT>();
                return await query.FirstOrDefaultAsync(p => p.Email.Equals(email));
            }
            else if (typeof(T) == typeof(ETUDIANT))
            {
                var query = _dbSet.Cast<ETUDIANT>();
                return await query.FirstOrDefaultAsync(p => p.Email.Equals(email));
            }
            

            // Si on tente d’utiliser cette méthode pour un autre type, lève une erreur
            throw new InvalidOperationException("FindByEmailAsync ne peut être utilisé que pour les Personnes.");
        }




        public IQueryable<T> Query()
        {
            return _context.Set<T>().AsQueryable();
        }


    }
    
}

