using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;


namespace Banane.ObjetService
{
    public interface IRepositoryService <T> where T : class
    {
        

        
            /// <summary>
            /// Récupère une entité par son identifiant.
            /// </summary>
            Task<T?> GetByIdAsync(int id);
            Task<T?> GetByIdAsyncGuid(Guid id);

            Task<IEnumerable<T>> GetByConditionAsync(Expression<Func<T, bool>> expression);
        

            /// <summary>
            /// Récupère toutes les entités.
            /// </summary>
            Task<IEnumerable<T>> ListAsync();


            Task<object?> FindByEmailAsync(string email);

            /// <summary>
            /// Ajoute une nouvelle entité dans le contexte EF.
            /// </summary>
            Task AddAsync(T entity);

            /// <summary>
            /// Met à jour une entité existante.
            /// </summary>
            void Update(T entity);

            /// <summary>
            /// Supprime une entité du contexte EF.
            /// </summary>
            void Delete(T entity);

            Task SaveChangesAsync(); // ✅ AJOUTER cette méthode ici

        /// <summary>
        /// Recherche un patient par son email (lié à Authentification).
        /// </summary>


            IQueryable<T> Query();






    }
}
