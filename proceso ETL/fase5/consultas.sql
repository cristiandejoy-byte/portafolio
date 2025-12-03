
SELECT
    p."Modalidad de Contratacion",
    COUNT(p.id_del_proceso) AS "Total Contratos",
    SUM(a."Valor Total Adjudicacion") AS "Valor Total Adjudicado"
FROM
    procesos p
JOIN
    adjudicaciones a ON p.id_del_proceso = a."ID del Proceso"
GROUP BY
    p."Modalidad de Contratacion"
ORDER BY
    "Valor Total Adjudicado" DESC;