import { describe, it, expect } from 'vitest';
import { parseOrgStructure } from './parseOrgStructure';

describe('parseOrgStructure', () => {
	describe('empty input', () => {
		it('should return error for empty input', () => {
			const result = parseOrgStructure('');
			expect(result.success).toBe(false);
			expect(result.errors.length).toBeGreaterThan(0);
			expect(result.errors[0].message).toContain('empty');
		});

		it('should return error for whitespace-only input', () => {
			const result = parseOrgStructure('   \n  \n\t  ');
			expect(result.success).toBe(false);
			expect(result.errors.length).toBeGreaterThan(0);
		});
	});

	describe('basic structure parsing', () => {
		it('should parse a simple circle', () => {
			const text = '- circle: Product Team';
			const result = parseOrgStructure(text);

			expect(result.success).toBe(true);
			expect(result.root).not.toBeNull();
			expect(result.root?.children.length).toBe(1);
			expect(result.root?.children[0].type).toBe('circle');
			expect(result.root?.children[0].name).toBe('Product Team');
			expect(result.root?.children[0].depth).toBe(1);
		});

		it('should parse multiple top-level circles', () => {
			const text = `- circle: Product Team
- circle: Engineering
- circle: Sales`;

			const result = parseOrgStructure(text);

			expect(result.success).toBe(true);
			expect(result.root?.children.length).toBe(3);
			expect(result.root?.children[0].name).toBe('Product Team');
			expect(result.root?.children[1].name).toBe('Engineering');
			expect(result.root?.children[2].name).toBe('Sales');
		});

		it('should parse roles within a circle', () => {
			const text = `- circle: Product Team
  -- role: Product Manager
  -- role: Designer`;

			const result = parseOrgStructure(text);

			expect(result.success).toBe(true);
			expect(result.root?.children.length).toBe(1);
			const circle = result.root?.children[0];
			expect(circle?.type).toBe('circle');
			expect(circle?.children.length).toBe(2);
			expect(circle?.children[0].type).toBe('role');
			expect(circle?.children[0].name).toBe('Product Manager');
			expect(circle?.children[1].type).toBe('role');
			expect(circle?.children[1].name).toBe('Designer');
		});

		it('should parse nested circles', () => {
			const text = `- circle: Product Team
  -- circle: Engineering
     --- role: Tech Lead
     --- role: Senior Engineer`;

			const result = parseOrgStructure(text);

			expect(result.success).toBe(true);
			expect(result.root?.children.length).toBe(1);
			const productTeam = result.root?.children[0];
			expect(productTeam?.type).toBe('circle');
			expect(productTeam?.children.length).toBe(1);
			const engineering = productTeam?.children[0];
			expect(engineering?.type).toBe('circle');
			expect(engineering?.children.length).toBe(2);
			expect(engineering?.children[0].name).toBe('Tech Lead');
			expect(engineering?.children[1].name).toBe('Senior Engineer');
		});
	});

	describe('root declaration', () => {
		it('should parse root circle name', () => {
			const text = `root: Company Name
- circle: Product Team`;

			const result = parseOrgStructure(text);

			expect(result.success).toBe(true);
			expect(result.root?.name).toBe('Company Name');
		});

		it('should error on duplicate root declarations', () => {
			const text = `root: Company Name
root: Another Name`;

			const result = parseOrgStructure(text);

			expect(result.success).toBe(false);
			expect(
				result.errors.some((e) => e.message.includes('Root circle can only be declared once'))
			).toBe(true);
		});

		it('should error on empty root name', () => {
			const text = `root:
- circle: Product Team`;

			const result = parseOrgStructure(text);

			expect(result.success).toBe(false);
			expect(
				result.errors.some((e) => e.message.includes('Root circle name cannot be empty'))
			).toBe(true);
		});
	});

	describe('purpose parsing', () => {
		it('should parse purpose for circles', () => {
			const text = `- circle: Product Team
  purpose: Build amazing products`;

			const result = parseOrgStructure(text);

			expect(result.success).toBe(true);
			const circle = result.root?.children[0];
			expect(circle?.purpose).toBe('Build amazing products');
		});

		it('should parse purpose for roles', () => {
			const text = `- circle: Product Team
  -- role: Product Manager
     purpose: Lead product discovery and delivery`;

			const result = parseOrgStructure(text);

			expect(result.success).toBe(true);
			const role = result.root?.children[0].children[0];
			expect(role?.purpose).toBe('Lead product discovery and delivery');
		});

		it('should handle purpose with colon in text', () => {
			const text = `- circle: Product Team
  purpose: Build products: fast and reliable`;

			const result = parseOrgStructure(text);

			expect(result.success).toBe(true);
			const circle = result.root?.children[0];
			expect(circle?.purpose).toBe('Build products: fast and reliable');
		});
	});

	describe('comments', () => {
		it('should ignore comment lines', () => {
			const text = `# This is a comment
- circle: Product Team
# Another comment
  -- role: Product Manager`;

			const result = parseOrgStructure(text);

			expect(result.success).toBe(true);
			expect(result.root?.children.length).toBe(1);
			expect(result.root?.children[0].children.length).toBe(1);
		});

		it('should ignore empty lines', () => {
			const text = `- circle: Product Team

  -- role: Product Manager

  -- role: Designer`;

			const result = parseOrgStructure(text);

			expect(result.success).toBe(true);
			expect(result.root?.children[0].children.length).toBe(2);
		});
	});

	describe('syntax errors', () => {
		it('should error on invalid line format', () => {
			const text = `- circle: Product Team
invalid line`;

			const result = parseOrgStructure(text);

			expect(result.success).toBe(false);
			expect(result.errors.some((e) => e.type === 'syntax')).toBe(true);
		});

		it('should error on empty circle name', () => {
			const text = `- circle:`;

			const result = parseOrgStructure(text);

			expect(result.success).toBe(false);
			expect(result.errors.some((e) => e.message.includes('Circle name cannot be empty'))).toBe(
				true
			);
		});

		it('should error on empty role name', () => {
			const text = `- circle: Product Team
  -- role:`;

			const result = parseOrgStructure(text);

			expect(result.success).toBe(false);
			expect(result.errors.some((e) => e.message.includes('Role name cannot be empty'))).toBe(true);
		});

		it('should error on invalid indentation (skipping levels)', () => {
			const text = `- circle: Product Team
     --- role: Product Manager`;

			const result = parseOrgStructure(text);

			expect(result.success).toBe(false);
			expect(result.errors.some((e) => e.message.includes('Invalid indentation'))).toBe(true);
		});
	});

	describe('business rules', () => {
		it('should error when role has children', () => {
			const text = `- circle: Product Team
  -- role: Product Manager
     --- role: Junior PM`;

			const result = parseOrgStructure(text);

			expect(result.success).toBe(false);
			expect(result.errors.some((e) => e.message.includes('cannot have children'))).toBe(true);
			expect(result.errors.some((e) => e.type === 'business-rule')).toBe(true);
		});

		it('should validate roles cannot have children recursively', () => {
			const text = `- circle: Product Team
  -- role: Product Manager`;

			const result = parseOrgStructure(text);

			expect(result.success).toBe(true);
			const role = result.root?.children[0].children[0];
			expect(role?.children.length).toBe(0);
		});
	});

	describe('warnings', () => {
		it('should warn on duplicate names', () => {
			const text = `- circle: Product Team
- circle: Product Team`;

			const result = parseOrgStructure(text);

			expect(result.success).toBe(true);
			expect(result.warnings.some((w) => w.message.includes('Duplicate'))).toBe(true);
		});

		it('should warn on Lead role names', () => {
			const text = `- circle: Product Team
  -- role: Product Lead`;

			const result = parseOrgStructure(text);

			expect(result.success).toBe(true);
			expect(result.warnings.some((w) => w.message.includes('Circle Lead'))).toBe(true);
		});

		it('should warn on overwriting purpose', () => {
			const text = `- circle: Product Team
  purpose: First purpose
- purpose: Second purpose`;

			const result = parseOrgStructure(text);

			expect(result.success).toBe(true);
			expect(result.warnings.some((w) => w.message.includes('Purpose already set'))).toBe(true);
		});
	});

	describe('complex nested structures', () => {
		it('should parse 3+ levels of nesting', () => {
			const text = `- circle: Product Team
  -- circle: Engineering
     --- circle: Platform
        ---- role: Platform Lead
        ---- role: DevOps Engineer
     --- role: Tech Lead
  -- role: Product Manager`;

			const result = parseOrgStructure(text);

			expect(result.success).toBe(true);
			const productTeam = result.root?.children[0];
			expect(productTeam?.children.length).toBe(2); // Engineering circle + Product Manager role

			const engineering = productTeam?.children.find((c) => c.type === 'circle');
			expect(engineering?.children.length).toBe(2); // Platform circle + Tech Lead role

			const platform = engineering?.children.find((c) => c.type === 'circle');
			expect(platform?.children.length).toBe(2); // Two roles
		});

		it('should parse example from task document', () => {
			const text = `# Sales Team Structure
- circle: Sales
  purpose: Drive revenue and customer acquisition
  
  -- role: Sales Director
     purpose: Lead sales strategy and team
  
  -- role: Account Manager
     purpose: Manage customer relationships
  
  -- circle: Sales Operations
     purpose: Enable sales team efficiency
     
     --- role: Sales Ops Lead
         purpose: Optimize sales processes`;

			const result = parseOrgStructure(text);

			expect(result.success).toBe(true);
			expect(result.root?.children.length).toBe(1);
			const sales = result.root?.children[0];
			expect(sales?.name).toBe('Sales');
			expect(sales?.purpose).toBe('Drive revenue and customer acquisition');
			expect(sales?.children.length).toBe(3); // 2 roles + 1 circle

			const salesOps = sales?.children.find((c) => c.type === 'circle');
			expect(salesOps?.name).toBe('Sales Operations');
			expect(salesOps?.purpose).toBe('Enable sales team efficiency');
			expect(salesOps?.children.length).toBe(1);
		});
	});

	describe('edge cases', () => {
		it('should handle trailing whitespace', () => {
			const text = `- circle: Product Team   \n  -- role: Product Manager   `;

			const result = parseOrgStructure(text);

			expect(result.success).toBe(true);
			expect(result.root?.children[0].name).toBe('Product Team');
			expect(result.root?.children[0].children[0].name).toBe('Product Manager');
		});

		it('should handle multiple spaces in indentation', () => {
			const text = `- circle: Product Team
    -- role: Product Manager`;

			const result = parseOrgStructure(text);

			expect(result.success).toBe(true);
			expect(result.root?.children[0].children.length).toBe(1);
		});

		it('should handle mixed tabs and spaces (treats as spaces)', () => {
			const text = `- circle: Product Team
\t  -- role: Product Manager`;

			const result = parseOrgStructure(text);

			// Should still parse (tabs treated as whitespace)
			expect(result.success).toBe(true);
		});

		it('should handle very long names', () => {
			const longName = 'A'.repeat(200);
			const text = `- circle: ${longName}`;

			const result = parseOrgStructure(text);

			expect(result.success).toBe(true);
			expect(result.root?.children[0].name).toBe(longName);
		});

		it('should handle special characters in names', () => {
			const text = `- circle: Product & Engineering Team (2024)
  -- role: Product Manager - Lead`;

			const result = parseOrgStructure(text);

			expect(result.success).toBe(true);
			expect(result.root?.children[0].name).toBe('Product & Engineering Team (2024)');
			expect(result.root?.children[0].children[0].name).toBe('Product Manager - Lead');
		});
	});

	describe('line number tracking', () => {
		it('should track line numbers for errors', () => {
			const text = `- circle: Product Team
invalid line
  -- role: Product Manager`;

			const result = parseOrgStructure(text);

			expect(result.success).toBe(false);
			const error = result.errors.find((e) => e.type === 'syntax');
			expect(error?.lineNumber).toBe(2);
		});

		it('should track line numbers for warnings', () => {
			const text = `- circle: Product Team
  -- role: Product Lead`;

			const result = parseOrgStructure(text);

			expect(result.success).toBe(true);
			const warning = result.warnings.find((w) => w.message.includes('Circle Lead'));
			expect(warning?.lineNumber).toBe(2);
		});
	});

	describe('performance', () => {
		it('should parse 50-node structure quickly', () => {
			// Generate a 50-node structure
			let text = '';
			for (let i = 0; i < 10; i++) {
				text += `- circle: Team ${i}\n`;
				for (let j = 0; j < 4; j++) {
					text += `  -- role: Role ${i}-${j}\n`;
				}
			}

			const start = performance.now();
			const result = parseOrgStructure(text);
			const duration = performance.now() - start;

			expect(result.success).toBe(true);
			expect(duration).toBeLessThan(100); // Should parse in < 100ms
		});
	});
});
